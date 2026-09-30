import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ImpostazioniService } from '../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../core/services/lingua/lingua-service';
import { ImportiPrenotazioneInterface } from '../models/prenotazione/prenotazione-model';
import { RiepilogoPrezzoComponent } from './riepilogo-prezzo-component';

describe('RiepilogoPrezzoComponent', () => {
  const importi: ImportiPrenotazioneInterface = {
    importo_soggiorno: 300,
    sconto_promozione: 0,
    sconto_codice: 30,
    percentuale_fedelta: 5,
    sconto_fedelta: 13.5,
    importo_pacchetto: 0,
    importo_servizi: 40,
    tassa_soggiorno: 6,
    totale: 302.5,
    acconto_richiesto: 90,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        traduzioniTest({ riepilogoPrezzo: { sconto_fedelta: 'Fedeltà {{ percentuale }}%' } }),
      ],
      providers: [
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => 'EUR' } },
      ],
    });
  });

  async function crea(valori: ImportiPrenotazioneInterface) {
    const fixture = TestBed.createComponent(RiepilogoPrezzoComponent);
    fixture.componentRef.setInput('importi', valori);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const righe = [...elemento.querySelectorAll('.riga')].map((riga) => [
      riga.querySelector('dt')?.textContent?.trim(),
      riga.querySelector('dd')?.textContent?.replace(/\s/g, ' ').trim(),
    ]);
    return { elemento, righe };
  }

  it('mostra solo le voci con un importo, sottraendo gli sconti', async () => {
    const { righe } = await crea(importi);

    expect(righe).toEqual([
      ['riepilogoPrezzo.importo_soggiorno', '300,00 €'],
      ['riepilogoPrezzo.sconto_codice', '−30,00 €'],
      ['Fedeltà 5%', '−13,50 €'],
      ['riepilogoPrezzo.importo_servizi', '40,00 €'],
      ['riepilogoPrezzo.tassa_soggiorno', '6,00 €'],
      ['riepilogoPrezzo.totale', '302,50 €'],
      ['riepilogoPrezzo.acconto', '90,00 €'],
    ]);
  });

  it('legge gli importi arrivati come testo e senza acconto non lo mostra', async () => {
    const { elemento } = await crea({
      ...importi,
      sconto_codice: '0.00' as unknown as number,
      acconto_richiesto: 0,
    });

    expect(elemento.textContent).not.toContain('riepilogoPrezzo.sconto_codice');
    expect(elemento.querySelector('.acconto')).toBeNull();
  });
});
