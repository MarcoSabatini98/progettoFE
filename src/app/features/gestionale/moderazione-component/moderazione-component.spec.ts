import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { RecensioniService } from '../../../core/services/recensioni/recensioni-service';
import { ModerazioneComponent } from './moderazione-component';

describe('ModerazioneComponent', () => {
  const recensioni = { elencaRecensioni: vi.fn() };
  const pagina = {
    elementi: [{ id: 1, voto: 5, titolo: 'Ottimo', stato: 'in_attesa', creato_il: '2030-06-01' }],
    totale: 1,
    pagina: 1,
    perPagina: 10,
    pagine: 1,
  };

  beforeEach(() => {
    recensioni.elencaRecensioni.mockReset();
    recensioni.elencaRecensioni.mockReturnValue(of(pagina));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: RecensioniService, useValue: recensioni },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(ModerazioneComponent);
    await fixture.whenStable();
    return { fixture, elemento: fixture.nativeElement as HTMLElement };
  }

  it('parte dalle recensioni in attesa', async () => {
    const { elemento } = await crea();

    expect(recensioni.elencaRecensioni).toHaveBeenCalledWith({
      stato: 'in_attesa',
      voto_max: undefined,
      pagina: 1,
      perPagina: 10,
    });
    expect(elemento.querySelectorAll('app-riga-recensione')).toHaveLength(1);
  });

  it('filtra per stato e solo le negative', async () => {
    const { fixture, elemento } = await crea();
    const stato = elemento.querySelector<HTMLSelectElement>('form[role=search] select')!;

    stato.value = '';
    stato.dispatchEvent(new Event('change'));
    elemento.querySelector<HTMLInputElement>('form[role=search] input[type=checkbox]')!.click();
    await fixture.whenStable();

    expect(recensioni.elencaRecensioni).toHaveBeenLastCalledWith({
      stato: undefined,
      voto_max: 2,
      pagina: 1,
      perPagina: 10,
    });
  });

  it('mostra l errore se l elenco non arriva', async () => {
    recensioni.elencaRecensioni.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500, error: {} })),
    );
    const { elemento } = await crea();

    expect(elemento.querySelector('[role=alert]')).not.toBeNull();
  });
});
