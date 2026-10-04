import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { ManutenzioneService } from '../../../core/services/manutenzione/manutenzione-service';
import { SegnalazioneManutenzioneInterface } from '../../../shared/models/segnalazione-manutenzione/segnalazione-manutenzione-model';
import { GestioneSegnalazioneComponent } from './gestione-segnalazione-component';

describe('GestioneSegnalazioneComponent', () => {
  const manutenzione = { aggiornaSegnalazione: vi.fn(), elencaIncaricabili: vi.fn() };
  const avvisi = { mostra: vi.fn() };
  const segnalazione = {
    id: 5,
    stato: 'aperta',
    assegnata_a: null,
    priorita: 'normale',
    note_risoluzione: null,
    camera: { numero: '204', stato: 'attiva' },
  } as unknown as SegnalazioneManutenzioneInterface;

  beforeEach(() => {
    Object.values(manutenzione).forEach((spia) => spia.mockReset());
    avvisi.mostra.mockReset();
    manutenzione.elencaIncaricabili.mockReturnValue(
      of([{ id: 2, nome: 'Luca', cognome: 'Neri', ruolo: 'admin' }]),
    );
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: ManutenzioneService, useValue: manutenzione },
        { provide: AvvisiService, useValue: avvisi },
      ],
    });
  });

  async function crea(dati: Partial<SegnalazioneManutenzioneInterface> = {}) {
    const fixture = TestBed.createComponent(GestioneSegnalazioneComponent);
    fixture.componentRef.setInput('segnalazione', { ...segnalazione, ...dati });
    const salvata = vi.fn();
    fixture.componentInstance.salvata.subscribe(salvata);
    await fixture.whenStable();
    const elemento = fixture.nativeElement as HTMLElement;
    const scegli = async (campo: string, valore: string) => {
      const scelta = elemento.querySelector<HTMLSelectElement>(`[formControlName=${campo}]`)!;
      scelta.value = valore;
      scelta.dispatchEvent(new Event('change'));
      await fixture.whenStable();
    };
    const salva = async () => {
      elemento.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { elemento, salvata, scegli, salva };
  }

  it('senza modifiche non salva', async () => {
    const { salva } = await crea();

    await salva();

    expect(manutenzione.aggiornaSegnalazione).not.toHaveBeenCalled();
  });

  it('manda solo i campi cambiati, stato della camera compreso', async () => {
    manutenzione.aggiornaSegnalazione.mockReturnValue(of({ ...segnalazione, stato: 'in_corso' }));
    const { elemento, salvata, scegli, salva } = await crea();

    expect(elemento.textContent).toContain('Luca Neri');
    await scegli('stato', 'in_corso');
    await scegli('stato_camera', 'manutenzione');
    await salva();

    expect(manutenzione.aggiornaSegnalazione).toHaveBeenCalledWith(5, {
      stato: 'in_corso',
      stato_camera: 'manutenzione',
    });
    expect(avvisi.mostra).toHaveBeenCalledWith('gestionale.manutenzione.salvata', 'successo');
    expect(salvata).toHaveBeenCalled();
  });

  it('in area comune non c è lo stato della camera', async () => {
    const { elemento } = await crea({ camera: null });

    expect(elemento.querySelector('[formControlName=stato_camera]')).toBeNull();
  });

  it('mostra il motivo se il backend rifiuta', async () => {
    manutenzione.aggiornaSegnalazione.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 400, error: {} })),
    );
    const { elemento, scegli, salva } = await crea();

    await scegli('priorita', 'urgente');
    await salva();

    expect(elemento.querySelector('[role=alert]')).not.toBeNull();
  });
});
