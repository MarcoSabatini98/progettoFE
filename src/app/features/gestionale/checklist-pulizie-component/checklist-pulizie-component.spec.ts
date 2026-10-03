import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { PulizieService } from '../../../core/services/pulizie/pulizie-service';
import { ChecklistPulizieComponent } from './checklist-pulizie-component';

describe('ChecklistPulizieComponent', () => {
  const pulizie = {
    elencaVoci: vi.fn(),
    aggiungiVoce: vi.fn(),
    aggiornaVoce: vi.fn(),
    eliminaVoce: vi.fn(),
  };
  const voci = [
    { id: 1, voce: 'Bagno', tipo_pulizia: 'partenza', ordine: 4, attiva: true },
    { id: 2, voce: 'Letti', tipo_pulizia: 'partenza', ordine: 7, attiva: false },
  ];

  beforeEach(() => {
    Object.values(pulizie).forEach((spia) => spia.mockReset());
    pulizie.elencaVoci.mockReturnValue(of(voci));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [provideRouter([]), { provide: PulizieService, useValue: pulizie }],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(ChecklistPulizieComponent);
    await fixture.whenStable();
    return { fixture, elemento: fixture.nativeElement as HTMLElement };
  }

  it('raggruppa le voci per tipo di pulizia', async () => {
    const { elemento } = await crea();

    const sezioni = elemento.querySelectorAll('section');
    expect(sezioni).toHaveLength(4);
    expect(sezioni[0].querySelectorAll('li.voce')).toHaveLength(2);
    expect(sezioni[1].textContent).toContain('gestionale.pulizie.nessunaVoce');
  });

  it('aggiunge una voce in fondo al suo tipo e ricarica', async () => {
    pulizie.aggiungiVoce.mockReturnValue(of({}));
    const { fixture, elemento } = await crea();
    const campo = elemento.querySelector<HTMLInputElement>('input[type=text]')!;

    campo.value = 'Specchi';
    campo.dispatchEvent(new Event('input'));
    elemento.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(pulizie.aggiungiVoce).toHaveBeenCalledWith({
      voce: 'Specchi',
      tipo_pulizia: 'partenza',
      ordine: 8,
    });
    expect(pulizie.elencaVoci).toHaveBeenCalledTimes(2);
    expect(campo.value).toBe('');
  });

  it('disattiva ed elimina una voce', async () => {
    pulizie.aggiornaVoce.mockReturnValue(of({}));
    pulizie.eliminaVoce.mockReturnValue(of(null));
    const { elemento } = await crea();

    elemento.querySelector<HTMLInputElement>('input[type=checkbox]')!.click();
    elemento.querySelector<HTMLButtonElement>('li.voce button')!.click();

    expect(pulizie.aggiornaVoce).toHaveBeenCalledWith(1, { attiva: false });
    expect(pulizie.eliminaVoce).toHaveBeenCalledWith(1);
  });

  it('mostra il motivo del rifiuto', async () => {
    pulizie.eliminaVoce.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 404, error: {} })),
    );
    const { fixture, elemento } = await crea();

    elemento.querySelector<HTMLButtonElement>('li.voce button')!.click();
    fixture.detectChanges();

    expect(elemento.querySelector('[role=alert]')).not.toBeNull();
  });
});
