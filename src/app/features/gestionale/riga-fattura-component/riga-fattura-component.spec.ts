import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { FatturaInterface } from '../../../shared/models/fattura/fattura-model';
import { RigaFatturaComponent } from './riga-fattura-component';

describe('RigaFatturaComponent', () => {
  const fattura = {
    id: 9,
    tipo_documento: 'TD01',
    anno: 2030,
    sezionale: 'A',
    numero: 12,
    data_emissione: '2030-06-03',
    cliente_denominazione: null,
    cliente_nome: 'Anna',
    cliente_cognome: 'Rossi',
    totale: 220,
    stato_sdi: 'da_inviare',
  } as unknown as FatturaInterface;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  function crea(dati: Partial<FatturaInterface> = {}) {
    const fixture = TestBed.createComponent(RigaFatturaComponent);
    fixture.componentRef.setInput('fattura', { ...fattura, ...dati });
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('porta alla scheda con totale, intestatario e stato SDI', () => {
    const elemento = crea();

    expect(elemento.querySelector('a')?.getAttribute('href')).toBe('/staff/fatture/9');
    expect(elemento.querySelector('.camera')?.textContent).toContain('220');
    expect(elemento.querySelector('strong')?.textContent).toContain('portale.fatture.TD01');
    expect(elemento.textContent).toContain('Rossi Anna');
    expect(elemento.querySelector('.stato-prenotazione')?.getAttribute('data-stato')).toBe(
      'da_inviare',
    );
  });

  it("senza numero è una bozza; un'azienda si vede per denominazione", () => {
    const elemento = crea({ numero: null, cliente_denominazione: 'Acme Srl' });

    expect(elemento.querySelector('strong')?.textContent).toContain(
      'gestionale.fatture.stati.bozza',
    );
    expect(elemento.textContent).toContain('Acme Srl');
    expect(elemento.textContent).not.toContain('Rossi');
  });
});
