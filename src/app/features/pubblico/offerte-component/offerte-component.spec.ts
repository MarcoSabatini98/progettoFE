import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
    tipologia: { id: 2, nome: 'Superior', slug: 'superior' },
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
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 25, 10));
    tariffe.elencaPacchettiPubblici.mockReturnValue(of([pacchetto]));
    tariffe.elencaPromozioniPubbliche.mockReturnValue(of([promozione]));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: TariffeService, useValue: tariffe },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  afterEach(() => vi.useRealTimers());

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
    expect(elemento.querySelectorAll('h3')[1]?.textContent).toBe('Weekend romantico');
    expect(inclusi).toEqual(['2 × Colazione', 'Spumante']);
    expect(elemento.querySelectorAll('.condizioni')[1]?.textContent).toContain('offerte.fino');
  });

  it('mostra le promozioni con lo sconto', async () => {
    const elemento = await crea();

    expect(elemento.querySelector('.sconto')?.textContent).toContain('offerte.scontoPercentuale');
    expect(elemento.querySelectorAll('.offerta')).toHaveLength(2);
  });

  it('prima le promozioni, poi i pacchetti; la prima di ogni sezione in vetrina', async () => {
    tariffe.elencaPacchettiPubblici.mockReturnValue(of([pacchetto, { ...pacchetto, id: 2 }]));

    const elemento = await crea();

    const titoli = [...elemento.querySelectorAll('.sezione-titolo')].map((h2) => h2.textContent);
    expect(titoli).toEqual(['offerte.promozioni', 'offerte.pacchetti']);
    expect(elemento.querySelectorAll('.vetrina')).toHaveLength(2);
    expect(elemento.querySelectorAll('.offerta:not(.vetrina)')).toHaveLength(1);
  });

  it('Prenota porta alla tipologia dell’offerta, se ne ha una', async () => {
    const elemento = await crea();

    const link = [...elemento.querySelectorAll('a.prenota')].map((a) => a.getAttribute('href'));
    expect(link).toEqual(['/prenota', '/prenota?tipologia=superior']);
  });

  it('segnala gli ultimi giorni: la promozione finisce il 31, il pacchetto a dicembre', async () => {
    const elemento = await crea();

    const scadenze = elemento.querySelectorAll('.scadenza');
    expect(scadenze).toHaveLength(1);
    expect(scadenze[0].textContent).toContain('offerte.ultimiGiorni');
  });

  it('la promozione finisce con la finestra di prenotazione, se chiude prima', async () => {
    tariffe.elencaPromozioniPubbliche.mockReturnValue(
      of([{ ...promozione, prenotabile_al: '2026-10-25' }]),
    );

    const elemento = await crea();

    expect(elemento.querySelector('.scadenza')?.textContent).toContain('offerte.ultimoGiorno');
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
