import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { ManutenzioneService } from '../../../core/services/manutenzione/manutenzione-service';
import { SchedaSegnalazioneComponent } from './scheda-segnalazione-component';

describe('SchedaSegnalazioneComponent', () => {
  const manutenzione = { leggiSegnalazione: vi.fn(), elencaIncaricabili: vi.fn() };
  const auth = { haPermessi: vi.fn() };
  const segnalazione = {
    id: 5,
    titolo: 'Condizionatore guasto',
    descrizione: 'Non raffredda',
    priorita: 'alta',
    stato: 'risolta',
    assegnata_a: 2,
    note_risoluzione: 'Ricaricato il gas',
    risolta_il: '2030-06-02T10:00:00Z',
    creato_il: '2030-06-01T08:00:00Z',
    camera: { numero: '204', stato: 'attiva' },
    segnalatore: { nome: 'Anna', cognome: 'Bianchi' },
    incaricato: { nome: 'Luca', cognome: 'Neri' },
  };

  beforeEach(() => {
    Object.values(manutenzione).forEach((spia) => spia.mockReset());
    manutenzione.leggiSegnalazione.mockReturnValue(of(segnalazione));
    manutenzione.elencaIncaricabili.mockReturnValue(of([]));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: ManutenzioneService, useValue: manutenzione },
        { provide: AuthService, useValue: auth },
        { provide: AvvisiService, useValue: { mostra: vi.fn() } },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
      ],
    });
  });

  async function crea(gestore = true) {
    auth.haPermessi.mockReturnValue(gestore);
    const fixture = TestBed.createComponent(SchedaSegnalazioneComponent);
    fixture.componentRef.setInput('id', '5');
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('chi gestisce vede i dati e il modulo di gestione', async () => {
    const elemento = await crea();

    expect(manutenzione.leggiSegnalazione).toHaveBeenCalledWith(5);
    expect(elemento.querySelector('h1')?.textContent).toContain('Condizionatore guasto');
    expect(elemento.textContent).toContain('Anna Bianchi');
    expect(elemento.textContent).toContain('Luca Neri');
    expect(elemento.textContent).toContain('gestionale.manutenzione.risoltaIl');
    expect(elemento.querySelector('app-gestione-segnalazione')).not.toBeNull();
  });

  it('chi l ha segnalata la legge con le note di risoluzione', async () => {
    const elemento = await crea(false);

    expect(elemento.querySelector('app-gestione-segnalazione')).toBeNull();
    expect(elemento.textContent).toContain('Ricaricato il gas');
  });

  it('mostra l errore se la segnalazione non è accessibile', async () => {
    manutenzione.leggiSegnalazione.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 403, error: {} })),
    );
    const elemento = await crea();

    expect(elemento.querySelector('[role=alert]')).not.toBeNull();
  });
});
