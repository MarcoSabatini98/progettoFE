import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { PagamentoInterface } from '../../../shared/models/pagamento/pagamento-model';
import { RigaPagamentoComponent } from './riga-pagamento-component';

describe('RigaPagamentoComponent', () => {
  const pagamento = {
    id: 4,
    prenotazione_id: 12,
    tipo: 'acconto',
    metodo: 'pos',
    stato: 'completato',
    importo: 90,
    pagato_il: '2030-06-01T08:00:00Z',
    creato_il: '2030-06-01T07:00:00Z',
    prenotazione: { id: 12, codice: 'BB-123' },
  } as unknown as PagamentoInterface;

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

  function crea(dati: Partial<PagamentoInterface> = {}) {
    const fixture = TestBed.createComponent(RigaPagamentoComponent);
    fixture.componentRef.setInput('pagamento', { ...pagamento, ...dati });
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('porta alla prenotazione con importo, tipo, metodo, codice e stato', () => {
    const elemento = crea();

    expect(elemento.querySelector('a')?.getAttribute('href')).toBe('/staff/prenotazioni/12');
    expect(elemento.querySelector('.camera')?.textContent).toContain('90');
    expect(elemento.querySelector('strong')?.textContent).toContain(
      'gestionale.tipiPagamento.acconto',
    );
    expect(elemento.querySelector('strong')?.textContent).toContain('gestionale.metodi.pos');
    expect(elemento.textContent).toContain('BB-123');
    expect(elemento.querySelector('.stato-prenotazione')?.getAttribute('data-stato')).toBe(
      'completato',
    );
  });

  it('i rimborsi escono col segno meno', () => {
    expect(crea().querySelector('.camera')?.textContent).not.toContain('−');
    expect(crea({ tipo: 'rimborso' }).querySelector('.camera')?.textContent).toContain('−');
  });
});
