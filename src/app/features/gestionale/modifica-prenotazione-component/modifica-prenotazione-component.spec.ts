import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CamereService } from '../../../core/services/camere/camere-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { PrenotazioniService } from '../../../core/services/prenotazioni/prenotazioni-service';
import { PrenotazioneInterface } from '../../../shared/models/prenotazione/prenotazione-model';
import { ModificaPrenotazioneComponent } from './modifica-prenotazione-component';

describe('ModificaPrenotazioneComponent', () => {
  const prenotazioni = { aggiornaPrenotazione: vi.fn() };
  const camere = { elencaCamere: vi.fn() };

  beforeEach(() => {
    prenotazioni.aggiornaPrenotazione.mockReset();
    camere.elencaCamere.mockReset().mockReturnValue(
      of([
        { id: 3, numero: '12', tipologia: { nome: 'Doppia' } },
        { id: 4, numero: '14', tipologia: { nome: 'Suite' } },
      ]),
    );
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: PrenotazioniService, useValue: prenotazioni },
        { provide: CamereService, useValue: camere },
      ],
    });
  });

  async function apri() {
    const fixture = TestBed.createComponent(ModificaPrenotazioneComponent);
    fixture.componentRef.setInput('prenotazione', {
      id: 7,
      camera_id: 3,
      data_arrivo: '2030-07-01',
      data_partenza: '2030-07-04',
      adulti: 2,
      bambini: 0,
      ora_arrivo_prevista: '15:30:00',
      richieste_speciali: 'Culla',
      note_interne: null,
    } as PrenotazioneInterface);
    const aggiornata = vi.fn();
    fixture.componentInstance.aggiornata.subscribe(aggiornata);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    elemento.querySelector('button')?.click();
    await fixture.whenStable();
    const scrivi = (selettore: string, valore: string) => {
      const campo = elemento.querySelector<HTMLInputElement>(selettore)!;
      campo.value = valore;
      campo.dispatchEvent(new Event('input'));
    };
    const salva = async () => {
      elemento.querySelector('form')?.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { elemento, scrivi, salva, aggiornata };
  }

  it('parte dai dati attuali, con le camere da scegliere', async () => {
    const { elemento } = await apri();

    expect(elemento.querySelectorAll('option')).toHaveLength(2);
    expect(elemento.querySelector<HTMLSelectElement>('select')?.selectedIndex).toBe(0);
    expect(elemento.querySelector<HTMLInputElement>('input[type="time"]')?.value).toBe('15:30');
  });

  it('manda solo i campi cambiati e un testo svuotato come null', async () => {
    prenotazioni.aggiornaPrenotazione.mockReturnValue(of({}));
    const { elemento, scrivi, salva, aggiornata } = await apri();

    scrivi('input[formControlName="adulti"]', '3');
    scrivi('textarea[formControlName="richieste_speciali"]', '');
    await salva();

    expect(prenotazioni.aggiornaPrenotazione).toHaveBeenCalledWith(7, {
      adulti: 3,
      richieste_speciali: null,
    });
    expect(aggiornata).toHaveBeenCalled();
    expect(elemento.querySelector('form')).toBeNull();
  });

  it('senza modifiche chiude senza chiamare il backend', async () => {
    const { elemento, salva } = await apri();

    await salva();

    expect(prenotazioni.aggiornaPrenotazione).not.toHaveBeenCalled();
    expect(elemento.querySelector('form')).toBeNull();
  });

  it('se la camera è occupata lo dice e resta aperto', async () => {
    prenotazioni.aggiornaPrenotazione.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { errore: { codice: 'CAMERA_NON_DISPONIBILE', messaggio: 'Occupata' } },
          }),
      ),
    );
    const { elemento, scrivi, salva } = await apri();

    scrivi('input[formControlName="data_partenza"]', '2030-07-06');
    await salva();

    expect(elemento.querySelector('[role="alert"]')?.textContent).toContain('Occupata');
    expect(elemento.querySelector('form')).not.toBeNull();
  });
});
