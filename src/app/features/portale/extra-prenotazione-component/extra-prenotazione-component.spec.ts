import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CamereService } from '../../../core/services/camere/camere-service';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { PrenotazioniService } from '../../../core/services/prenotazioni/prenotazioni-service';
import { PrenotazioneInterface } from '../../../shared/models/prenotazione/prenotazione-model';
import { ExtraPrenotazioneComponent } from './extra-prenotazione-component';

describe('ExtraPrenotazioneComponent', () => {
  const camere = { elencaExtraPubblici: vi.fn() };
  const prenotazioni = { aggiungiServizio: vi.fn(), rimuoviServizio: vi.fn() };
  const prenotazione = {
    id: 7,
    righe_servizi: [
      { servizio_id: 3, quantita: 2, totale: 30, servizio: { nome: 'Colazione', icona: null } },
    ],
  } as unknown as PrenotazioneInterface;

  beforeEach(() => {
    [camere.elencaExtraPubblici, ...Object.values(prenotazioni)].forEach((spia) =>
      spia.mockReset(),
    );
    camere.elencaExtraPubblici.mockReturnValue(
      of([{ id: 4, nome: 'Parcheggio', prezzo: 10, calcolo_prezzo: 'a_notte' }]),
    );
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: CamereService, useValue: camere },
        { provide: PrenotazioniService, useValue: prenotazioni },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  async function crea(modificabile: boolean) {
    const fixture = TestBed.createComponent(ExtraPrenotazioneComponent);
    fixture.componentRef.setInput('prenotazione', prenotazione);
    fixture.componentRef.setInput('modificabile', modificabile);
    const aggiornata = vi.fn();
    fixture.componentInstance.aggiornata.subscribe(aggiornata);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const aggiorna = () => fixture.whenStable();
    return { elemento, aggiornata, aggiorna };
  }

  it('a prenotazione chiusa mostra solo gli extra presi', async () => {
    const { elemento } = await crea(false);

    expect(elemento.querySelector('.righe')?.textContent).toContain('portale.extra.riga');
    expect(elemento.querySelector('.righe button')).toBeNull();
    expect(elemento.querySelector('form')).toBeNull();
    expect(camere.elencaExtraPubblici).not.toHaveBeenCalled();
  });

  it('toglie un extra e avvisa che la prenotazione è cambiata', async () => {
    prenotazioni.rimuoviServizio.mockReturnValue(of({}));
    const { elemento, aggiornata, aggiorna } = await crea(true);

    elemento.querySelector<HTMLButtonElement>('.righe button')?.click();
    await aggiorna();

    expect(prenotazioni.rimuoviServizio).toHaveBeenCalledWith(7, 3, true);
    expect(aggiornata).toHaveBeenCalled();
  });

  it('aggiunge un extra dal catalogo con la quantità scelta', async () => {
    prenotazioni.aggiungiServizio.mockReturnValue(of({}));
    const { elemento, aggiornata, aggiorna } = await crea(true);
    const scelta = elemento.querySelector('select')!;
    const quantita = elemento.querySelector<HTMLInputElement>('input[type="number"]')!;

    elemento.querySelector('form')?.dispatchEvent(new Event('submit'));
    expect(prenotazioni.aggiungiServizio).not.toHaveBeenCalled();

    scelta.selectedIndex = 1;
    scelta.dispatchEvent(new Event('change'));
    quantita.value = '3';
    quantita.dispatchEvent(new Event('input'));
    elemento.querySelector('form')?.dispatchEvent(new Event('submit'));
    await aggiorna();

    expect(prenotazioni.aggiungiServizio).toHaveBeenCalledWith(
      7,
      { servizio_id: 4, quantita: 3 },
      true,
    );
    expect(aggiornata).toHaveBeenCalled();
  });

  it('se il backend rifiuta spiega perché', async () => {
    prenotazioni.rimuoviServizio.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { errore: { codice: 'STATO_NON_VALIDO', messaggio: 'Troppo tardi' } },
          }),
      ),
    );
    const { elemento, aggiornata, aggiorna } = await crea(true);

    elemento.querySelector<HTMLButtonElement>('.righe button')?.click();
    await aggiorna();

    expect(elemento.querySelector('[role="alert"]')?.textContent).toContain('Troppo tardi');
    expect(aggiornata).not.toHaveBeenCalled();
  });
});
