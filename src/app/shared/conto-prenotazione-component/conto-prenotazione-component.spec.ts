import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ImpostazioniService } from '../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../core/services/lingua/lingua-service';
import { ImportiPrenotazioneInterface } from '../models/prenotazione/prenotazione-model';
import { RiepilogoPagamentoInterface } from '../models/riepilogo-pagamento/riepilogo-pagamento-model';
import { ContoPrenotazioneComponent } from './conto-prenotazione-component';

describe('ContoPrenotazioneComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => 'EUR' } },
      ],
    });
  });

  it('mostra il pagato al netto dei rimborsi e il saldo', async () => {
    const fixture = TestBed.createComponent(ContoPrenotazioneComponent);
    fixture.componentRef.setInput('importi', {
      importo_soggiorno: 300,
      totale: 300,
    } as ImportiPrenotazioneInterface);
    fixture.componentRef.setInput('pagamento', {
      incassato: '120.00',
      rimborsato: 20,
      saldo: 200,
    } as unknown as RiepilogoPagamentoInterface);
    await fixture.whenStable();

    const valori = [...(fixture.nativeElement as HTMLElement).querySelectorAll('.saldo dd')].map(
      (dd) => dd.textContent?.replace(/\s/g, ' ').trim(),
    );
    expect(valori).toEqual(['100,00 €', '200,00 €']);
  });
});
