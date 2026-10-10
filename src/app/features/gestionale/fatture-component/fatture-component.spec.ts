import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FattureService } from '../../../core/services/fatture/fatture-service';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { FattureComponent } from './fatture-component';

describe('FattureComponent', () => {
  const fatture = { elencaFatture: vi.fn() };
  const pagina = {
    elementi: [
      {
        id: 9,
        tipo_documento: 'TD01',
        anno: 2030,
        sezionale: 'A',
        numero: 12,
        data_emissione: '2030-06-03',
        cliente_denominazione: 'Acme Srl',
        totale: 220,
        stato_sdi: 'da_inviare',
      },
    ],
    totale: 1,
    pagina: 1,
    perPagina: 10,
    pagine: 1,
  };
  const tutte = { cerca: undefined, stato_sdi: [], anno: undefined, pagina: 1, perPagina: 10 };

  beforeEach(() => {
    vi.useFakeTimers();
    fatture.elencaFatture.mockReset();
    fatture.elencaFatture.mockReturnValue(of(pagina));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: FattureService, useValue: fatture },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  afterEach(() => vi.useRealTimers());

  // Coi timer finti lo scheduler di Angular aspetta il debounce: si fa scorrere il tempo.
  async function attendi(fixture: ComponentFixture<FattureComponent>) {
    await vi.runAllTimersAsync();
    await fixture.whenStable();
  }

  async function crea() {
    const fixture = TestBed.createComponent(FattureComponent);
    await attendi(fixture);
    const elemento: HTMLElement = fixture.nativeElement;
    const imposta = async (selettore: string, valore: string, evento = 'input') => {
      const campo = elemento.querySelector<HTMLInputElement>(`form[role=search] ${selettore}`)!;
      campo.value = valore;
      campo.dispatchEvent(new Event(evento));
      await attendi(fixture);
    };
    return { elemento, imposta };
  }

  it('parte da tutti i documenti', async () => {
    const { elemento } = await crea();

    expect(fatture.elencaFatture).toHaveBeenCalledWith(tutte);
    expect(elemento.querySelectorAll('app-riga-fattura')).toHaveLength(1);
  });

  it("cerca per intestatario, stato e anno, quest'ultimo solo intero", async () => {
    const { imposta } = await crea();

    await imposta('[formControlName=cerca]', ' acme ');
    await imposta('[formControlName=stato]', 'scartata', 'change');
    await imposta('[formControlName=anno]', '203');
    expect(fatture.elencaFatture).toHaveBeenLastCalledWith({
      ...tutte,
      cerca: 'acme',
      stato_sdi: ['scartata'],
    });

    await imposta('[formControlName=anno]', '2030');
    expect(fatture.elencaFatture).toHaveBeenLastCalledWith({
      ...tutte,
      cerca: 'acme',
      stato_sdi: ['scartata'],
      anno: 2030,
    });
  });

  it("mostra l'errore se l'elenco non arriva", async () => {
    fatture.elencaFatture.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500, error: {} })),
    );
    const { elemento } = await crea();

    expect(elemento.querySelector('[role=alert]')).not.toBeNull();
  });
});
