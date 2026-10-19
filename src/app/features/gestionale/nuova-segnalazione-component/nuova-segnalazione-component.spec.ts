import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { CamereService } from '../../../core/services/camere/camere-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { ManutenzioneService } from '../../../core/services/manutenzione/manutenzione-service';
import { NuovaSegnalazioneComponent } from './nuova-segnalazione-component';

describe('NuovaSegnalazioneComponent', () => {
  const manutenzione = { segnala: vi.fn() };
  const avvisi = { mostra: vi.fn() };

  beforeEach(() => {
    manutenzione.segnala.mockReset();
    avvisi.mostra.mockReset();
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: ManutenzioneService, useValue: manutenzione },
        { provide: AvvisiService, useValue: avvisi },
        {
          provide: CamereService,
          useValue: { elencaCamere: () => of([{ id: 4, numero: '104' }]) },
        },
      ],
    });
  });

  async function crea(gestore = false) {
    const fixture = TestBed.createComponent(NuovaSegnalazioneComponent);
    fixture.componentRef.setInput('gestore', gestore);
    const creata = vi.fn();
    fixture.componentInstance.creata.subscribe(creata);
    await fixture.whenStable();
    const elemento = fixture.nativeElement as HTMLElement;
    const scrivi = async (selettore: string, valore: string) => {
      const campo = elemento.querySelector<HTMLInputElement | HTMLSelectElement>(selettore)!;
      campo.value = valore;
      campo.dispatchEvent(new Event(campo instanceof HTMLSelectElement ? 'change' : 'input'));
      await fixture.whenStable();
    };
    const invia = async () => {
      elemento.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { elemento, creata, scrivi, invia };
  }

  it('senza titolo non parte', async () => {
    const { invia } = await crea();

    await invia();

    expect(manutenzione.segnala).not.toHaveBeenCalled();
  });

  it('segnala un guasto in area comune senza toccare stati di camera', async () => {
    manutenzione.segnala.mockReturnValue(of({ id: 1 }));
    const { scrivi, invia, creata } = await crea();

    await scrivi('input', ' Ascensore bloccato ');
    await invia();

    expect(manutenzione.segnala).toHaveBeenCalledWith({
      camera_id: null,
      titolo: ' Ascensore bloccato ',
      priorita: 'normale',
      descrizione: null,
      stato_camera: undefined,
    });
    expect(avvisi.mostra).toHaveBeenCalledWith('gestionale.manutenzione.inviata', 'successo');
    expect(creata).toHaveBeenCalledWith({ id: 1 });
  });

  it('chi gestisce sceglie la camera e la mette fuori servizio', async () => {
    manutenzione.segnala.mockReturnValue(of({ id: 2 }));
    const { elemento, scrivi, invia } = await crea(true);
    const selezioni = () => elemento.querySelectorAll<HTMLSelectElement>('select');

    // Area comune: niente stato di camera da cambiare.
    expect(selezioni()).toHaveLength(2);
    await scrivi('input', 'Doccia rotta');
    await scrivi('select', selezioni()[0].options[1].value);
    await scrivi('select[formControlName=stato_camera]', 'fuori_servizio');
    await invia();

    expect(manutenzione.segnala).toHaveBeenCalledWith(
      expect.objectContaining({ camera_id: 4, stato_camera: 'fuori_servizio' }),
    );
  });

  it('mostra il motivo se il backend rifiuta', async () => {
    manutenzione.segnala.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 403, error: {} })),
    );
    const { elemento, scrivi, invia } = await crea();

    await scrivi('input', 'Lampadina');
    await invia();

    expect(elemento.querySelector('[role=alert]')).not.toBeNull();
  });
});
