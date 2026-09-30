import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { TariffeService } from '../../../core/services/tariffe/tariffe-service';
import { PacchettoInterface } from '../../../shared/models/pacchetto/pacchetto-model';
import { PromozioneInterface } from '../../../shared/models/promozione/promozione-model';
import { OfferteComponent } from './offerte-component';

describe('OfferteComponent', () => {
  const tariffe = { elencaPacchettiPubblici: vi.fn(), elencaPromozioniPubbliche: vi.fn() };
  const pacchetto = {
    id: 1,
    nome: 'Weekend romantico',
    prezzo: 250,
    notti_min: 2,
    valido_dal: null,
    valido_al: '2026-12-31',
    servizi: [
      { id: 3, nome: 'Colazione', icona: null, PacchettoServizio: { quantita: 2 } },
      { id: 4, nome: 'Spumante', icona: 'wine_bar', PacchettoServizio: { quantita: 1 } },
    ],
  } as unknown as PacchettoInterface;
  const promozione = {
    id: 7,
    nome: 'Ottobre al mare',
    tipo_sconto: 'percentuale',
    valore: 15,
    soggiorno_dal: '2026-10-01',
    soggiorno_al: '2026-10-31',
  } as PromozioneInterface;

  beforeEach(() => {
    tariffe.elencaPacchettiPubblici.mockReturnValue(of([pacchetto]));
    tariffe.elencaPromozioniPubbliche.mockReturnValue(of([promozione]));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: TariffeService, useValue: tariffe },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(OfferteComponent);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('mostra i pacchetti con condizioni e servizi inclusi', async () => {
    const elemento = await crea();

    const inclusi = [...elemento.querySelectorAll('.incluso li')].map((li) =>
      li.textContent?.replace(/\s+/g, ' ').trim(),
    );
    expect(elemento.querySelector('h3')?.textContent).toBe('Weekend romantico');
    expect(inclusi).toEqual(['2 × Colazione', 'Spumante']);
    expect(elemento.querySelector('.condizioni')?.textContent).toContain('offerte.fino');
  });

  it('mostra le promozioni con lo sconto', async () => {
    const elemento = await crea();

    expect(elemento.querySelector('.sconto')?.textContent).toContain('offerte.scontoPercentuale');
    expect(elemento.querySelectorAll('.offerta')).toHaveLength(2);
  });

  it('senza offerte lo dice', async () => {
    tariffe.elencaPacchettiPubblici.mockReturnValue(of([]));
    tariffe.elencaPromozioniPubbliche.mockReturnValue(of([]));

    const elemento = await crea();

    expect(elemento.querySelector('.stato-vuoto')?.textContent).toContain('offerte.nessuna');
  });

  it('se il backend non risponde mostra un errore', async () => {
    tariffe.elencaPacchettiPubblici.mockReturnValue(throwError(() => new Error('500')));
    tariffe.elencaPromozioniPubbliche.mockReturnValue(throwError(() => new Error('500')));

    const elemento = await crea();

    expect(elemento.querySelector('.stato-vuoto')?.textContent).toContain('errori.generico');
  });
});
