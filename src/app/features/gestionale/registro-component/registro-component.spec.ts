import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { RegistroService } from '../../../core/services/registro/registro-service';
import { RegistroComponent } from './registro-component';

describe('RegistroComponent', () => {
  const registro = { elencaAttivita: vi.fn() };
  const pagina = {
    elementi: [
      {
        id: 1,
        tabella: 'fatture',
        record_id: 9,
        azione: 'modifica',
        dati_prima: { stato_sdi: 'bozza' },
        dati_dopo: { stato_sdi: 'da_inviare' },
        utente_id: null,
        ip: null,
        creato_il: '2030-06-01T10:00:00Z',
        utente: null,
      },
    ],
    totale: 1,
    pagina: 1,
    perPagina: 20,
    pagine: 1,
  };
  const tutto = { tabella: undefined, azione: undefined, dal: undefined, al: undefined };

  beforeEach(() => {
    registro.elencaAttivita.mockReset();
    registro.elencaAttivita.mockReturnValue(of(pagina));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: RegistroService, useValue: registro },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(RegistroComponent);
    await fixture.whenStable();
    const elemento = fixture.nativeElement as HTMLElement;
    const imposta = async (selettore: string, valore: string, evento = 'change') => {
      const campo = elemento.querySelector<HTMLInputElement>(`form[role=search] ${selettore}`)!;
      campo.value = valore;
      campo.dispatchEvent(new Event(evento));
      await fixture.whenStable();
    };
    return { elemento, imposta };
  }

  it('parte da tutte le modifiche, le più recenti in cima', async () => {
    const { elemento } = await crea();

    expect(registro.elencaAttivita).toHaveBeenCalledWith({ ...tutto, pagina: 1, perPagina: 20 });
    expect(elemento.querySelectorAll('app-riga-registro')).toHaveLength(1);
  });

  it('filtra per tabella, azione e periodo, con il giorno «al» compreso', async () => {
    const { imposta } = await crea();

    await imposta('select[formControlName=tabella]', 'fatture');
    await imposta('select[formControlName=azione]', 'modifica');
    await imposta('input[formControlName=dal]', '2030-06-01', 'input');
    await imposta('input[formControlName=al]', '2030-06-30', 'input');

    expect(registro.elencaAttivita).toHaveBeenLastCalledWith({
      tabella: 'fatture',
      azione: 'modifica',
      dal: '2030-06-01',
      al: '2030-07-01',
      pagina: 1,
      perPagina: 20,
    });
  });

  it('mostra il messaggio se il registro non si carica', async () => {
    registro.elencaAttivita.mockReturnValue(
      throwError(
        () => new HttpErrorResponse({ status: 500, error: { errore: { messaggio: 'Guasto' } } }),
      ),
    );
    const { elemento } = await crea();

    expect(elemento.querySelector('[role=alert]')?.textContent).toContain('Guasto');
  });
});
