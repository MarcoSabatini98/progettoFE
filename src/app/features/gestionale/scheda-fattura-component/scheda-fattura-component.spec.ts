import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { FattureService } from '../../../core/services/fatture/fatture-service';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { RegistroService } from '../../../core/services/registro/registro-service';
import { SchedaFatturaComponent } from './scheda-fattura-component';

describe('SchedaFatturaComponent', () => {
  const fatture = { leggiFattura: vi.fn(), eliminaBozza: vi.fn() };
  const auth = { haRuolo: vi.fn() };
  const fattura = {
    id: 9,
    prenotazione_id: 7,
    fattura_origine_id: null,
    tipo_documento: 'TD01',
    anno: 2030,
    sezionale: 'A',
    numero: 12,
    data_emissione: '2030-06-03',
    cliente_denominazione: 'Acme Srl',
    cliente_partita_iva: '01234567890',
    cliente_indirizzo: 'Via Roma 1',
    cliente_cap: '00100',
    cliente_comune: 'Roma',
    cliente_nazione: 'IT',
    codice_destinatario: 'ABC1234',
    imponibile: 200,
    imposta: 20,
    importo_esente: '0.00',
    totale: 220,
    stato_sdi: 'da_inviare',
    righe: [
      {
        id: 1,
        descrizione: 'Soggiorno',
        quantita: 2,
        prezzo_unitario: 100,
        aliquota_iva: 10,
        natura: null,
        totale: 200,
      },
    ],
  };

  beforeEach(() => {
    Object.values(fatture).forEach((spia) => spia.mockReset());
    auth.haRuolo.mockReturnValue(false);
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: FattureService, useValue: fatture },
        { provide: AuthService, useValue: auth },
        {
          provide: RegistroService,
          useValue: {
            leggiStoria: () => of({ elementi: [], totale: 0, pagina: 1, perPagina: 10, pagine: 0 }),
          },
        },
        { provide: AvvisiService, useValue: { mostra: vi.fn() } },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  async function crea(dati: object = {}) {
    fatture.leggiFattura.mockReturnValue(of({ ...fattura, ...dati }));
    const fixture = TestBed.createComponent(SchedaFatturaComponent);
    fixture.componentRef.setInput('id', '9');
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('mostra intestatario, righe e totali, col link alla prenotazione', async () => {
    const elemento = await crea();

    expect(fatture.leggiFattura).toHaveBeenCalledWith(9);
    expect(elemento.textContent).toContain('Acme Srl');
    expect(elemento.textContent).toContain('01234567890');
    expect(elemento.textContent).toContain('Soggiorno');
    expect(elemento.textContent).not.toContain('gestionale.fatture.esente');
    expect(elemento.querySelector('a[href="/staff/prenotazioni/7"]')).not.toBeNull();
  });

  it('emessa: file, esito SDI e storno; niente modifica', async () => {
    const elemento = await crea();

    for (const selettore of ['app-file-fattura', 'app-sdi-fattura', 'app-nota-di-credito']) {
      expect(elemento.querySelector(selettore)).not.toBeNull();
    }
    expect(elemento.querySelector('app-bozza-fattura')).toBeNull();
    expect(elemento.querySelector('app-elimina')).toBeNull();
  });

  it('una nota di credito non si storna e porta alla fattura stornata', async () => {
    const elemento = await crea({ tipo_documento: 'TD04', fattura_origine_id: 4 });

    expect(elemento.querySelector('app-nota-di-credito')).toBeNull();
    expect(elemento.querySelector('a[href="/staff/fatture/4"]')).not.toBeNull();
  });

  it('bozza: si modifica o si elimina', async () => {
    const elemento = await crea({ stato_sdi: 'bozza', numero: null, anno: null });

    expect(elemento.querySelector('h1')?.textContent).toContain('gestionale.fatture.stati.bozza');
    expect(elemento.querySelector('app-bozza-fattura')).not.toBeNull();
    expect(elemento.querySelector('app-elimina')).not.toBeNull();
    expect(elemento.querySelector('app-file-fattura')).toBeNull();
  });

  it("la storia delle modifiche la vede solo l'admin", async () => {
    expect((await crea()).querySelector('app-storia-record')).toBeNull();

    auth.haRuolo.mockReturnValue(true);
    expect((await crea()).querySelector('app-storia-record')).not.toBeNull();
  });

  it('se la fattura non esiste lo dice', async () => {
    fatture.leggiFattura.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({ status: 404, error: { errore: { messaggio: 'Non trovata' } } }),
      ),
    );
    const fixture = TestBed.createComponent(SchedaFatturaComponent);
    fixture.componentRef.setInput('id', '9');
    await fixture.whenStable();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role=alert]')?.textContent,
    ).toContain('Non trovata');
  });
});
