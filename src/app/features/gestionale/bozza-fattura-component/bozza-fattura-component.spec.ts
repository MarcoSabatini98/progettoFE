import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { FattureService } from '../../../core/services/fatture/fatture-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { FatturaInterface } from '../../../shared/models/fattura/fattura-model';
import { BozzaFatturaComponent } from './bozza-fattura-component';

describe('BozzaFatturaComponent', () => {
  const fatture = { aggiornaBozza: vi.fn(), emettiFattura: vi.fn() };
  const avvisi = { mostra: vi.fn() };
  const bozza = {
    id: 5,
    stato_sdi: 'bozza',
    cliente_denominazione: null,
    cliente_nome: 'Anna',
    cliente_cognome: 'Rossi',
    cliente_codice_fiscale: 'RSSNNA80A41H501U',
    cliente_partita_iva: null,
    cliente_indirizzo: 'Via Roma 1',
    cliente_cap: '00100',
    cliente_comune: 'Roma',
    cliente_provincia: 'RM',
    cliente_nazione: 'IT',
    codice_destinatario: '0000000',
    pec: null,
    note: null,
    righe: [
      {
        id: 1,
        descrizione: 'Soggiorno',
        quantita: '2.00',
        prezzo_unitario: '100.00',
        aliquota_iva: '10.00',
        natura: null,
      },
    ],
  } as unknown as FatturaInterface;

  beforeEach(() => {
    Object.values(fatture).forEach((spia) => spia.mockReset());
    avvisi.mostra.mockReset();
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: FattureService, useValue: fatture },
        { provide: AvvisiService, useValue: avvisi },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(BozzaFatturaComponent);
    fixture.componentRef.setInput('fattura', bozza);
    const aggiornata = vi.fn();
    fixture.componentInstance.aggiornata.subscribe(aggiornata);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const pulsante = (testo: string) =>
      [...elemento.querySelectorAll<HTMLButtonElement>('button')].find((b) =>
        b.textContent?.includes(testo),
      )!;
    const clicca = async (testo: string) => {
      pulsante(testo).click();
      await fixture.whenStable();
    };
    const salva = async () => {
      elemento.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { elemento, pulsante, clicca, salva, aggiornata };
  }

  it('salva intestatario e righe come numeri, coi vuoti a null', async () => {
    fatture.aggiornaBozza.mockReturnValue(of(bozza));
    const { elemento, salva, aggiornata } = await crea();
    expect(elemento.querySelector<HTMLInputElement>('[formControlName=descrizione]')!.value).toBe(
      'Soggiorno',
    );

    await salva();

    expect(fatture.aggiornaBozza).toHaveBeenCalledWith(5, {
      cliente: expect.objectContaining({ nome: 'Anna', cognome: 'Rossi', denominazione: '' }),
      note: null,
      righe: [
        {
          descrizione: 'Soggiorno',
          quantita: 2,
          prezzo_unitario: 100,
          aliquota_iva: 10,
          natura: null,
        },
      ],
    });
    expect(avvisi.mostra).toHaveBeenCalledWith('gestionale.fatture.salvata', 'successo');
    expect(aggiornata).toHaveBeenCalledWith(bozza);
  });

  it("la nuova riga prende l'aliquota dell'ultima; con modifiche non salvate non si emette", async () => {
    const { elemento, pulsante, clicca } = await crea();
    expect(pulsante('gestionale.fatture.bozza.emetti').disabled).toBe(false);

    await clicca('gestionale.fatture.righe.aggiungi');

    const aliquote = elemento.querySelectorAll<HTMLInputElement>('[formControlName=aliquota_iva]');
    expect(aliquote).toHaveLength(2);
    expect(aliquote[1].value).toBe('10');
    expect(pulsante('gestionale.fatture.bozza.emetti').disabled).toBe(true);

    await clicca('gestionale.fatture.righe.togli');
    expect(elemento.querySelectorAll('[formControlName=aliquota_iva]')).toHaveLength(1);
  });

  it('emette solo dopo la conferma', async () => {
    fatture.emettiFattura.mockReturnValue(of({ ...bozza, stato_sdi: 'da_inviare' }));
    const { clicca, aggiornata } = await crea();

    await clicca('gestionale.fatture.bozza.emetti');
    expect(fatture.emettiFattura).not.toHaveBeenCalled();
    await clicca('gestionale.fatture.bozza.emettiConferma');

    expect(fatture.emettiFattura).toHaveBeenCalledWith(5);
    expect(avvisi.mostra).toHaveBeenCalledWith('gestionale.fatture.emessa', 'successo');
    expect(aggiornata).toHaveBeenCalledOnce();
  });

  it('senza descrizione non salva; se il backend rifiuta lo spiega', async () => {
    fatture.aggiornaBozza.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { errore: { messaggio: 'Fattura già emessa' } },
          }),
      ),
    );
    const { elemento, salva } = await crea();
    const descrizione = elemento.querySelector<HTMLInputElement>('[formControlName=descrizione]')!;
    descrizione.value = '';
    descrizione.dispatchEvent(new Event('input'));
    await salva();
    expect(fatture.aggiornaBozza).not.toHaveBeenCalled();

    descrizione.value = 'Soggiorno';
    descrizione.dispatchEvent(new Event('input'));
    await salva();

    expect(elemento.querySelector('[role=alert]')?.textContent).toContain('Fattura già emessa');
  });
});
