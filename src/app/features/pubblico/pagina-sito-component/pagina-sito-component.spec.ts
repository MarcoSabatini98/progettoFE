import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { ContenutiService } from '../../../core/services/contenuti/contenuti-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { PaginaSitoInterface } from '../../../shared/models/pagina-sito/pagina-sito-model';
import { PaginaSitoComponent } from './pagina-sito-component';

describe('PaginaSitoComponent', () => {
  async function crea(pagina: Partial<PaginaSitoInterface>) {
    const contenuti = { leggiPaginaPubblica: vi.fn(() => of(pagina)) };
    TestBed.configureTestingModule({
      imports: [
        traduzioniTest({
          struttura: { titolo: 'La struttura', introduzione: 'Gli spazi della casa.' },
          layout: { paginaInArrivo: 'In arrivo' },
        }),
      ],
      providers: [
        { provide: ContenutiService, useValue: contenuti },
        { provide: LinguaService, useValue: { attiva: () => 'en' } },
      ],
    });
    const fixture = TestBed.createComponent(PaginaSitoComponent);
    fixture.componentRef.setInput('chiave', 'struttura');
    await fixture.whenStable();
    return { elemento: fixture.nativeElement as HTMLElement, contenuti };
  }

  it('con la copertina: foto a tutto schermo, descrizione, invito a scorrere e sezioni', async () => {
    const { elemento, contenuti } = await crea({
      descrizione: 'Casa sul mare',
      media: [{ percorso: 'media/casa.webp' } as never],
      sezioni: [{ id: 1, titolo: 'Il giardino', testo: 'Ulivi' } as never],
    });

    expect(contenuti.leggiPaginaPubblica).toHaveBeenCalledWith('struttura', 'en');
    expect(elemento.querySelector('.copertina-schermo .sfondo')).not.toBeNull();
    expect(elemento.querySelector('h1')?.textContent).toBe('La struttura');
    expect(elemento.querySelector('.introduzione')?.textContent).toBe('Casa sul mare');
    expect(elemento.querySelector('app-scorri')).not.toBeNull();
    expect(elemento.querySelector('app-sezioni h2')?.textContent).toBe('Il giardino');
  });

  it('senza contenuti: intestazione normale, introduzione predefinita e avviso', async () => {
    const { elemento } = await crea({ descrizione: null, media: [], sezioni: [] });

    expect(elemento.querySelector('.copertina-schermo')).toBeNull();
    expect(elemento.querySelector('.introduzione')?.textContent).toBe('Gli spazi della casa.');
    expect(elemento.querySelector('app-scorri')).toBeNull();
    expect(elemento.querySelector('.stato-vuoto')?.textContent).toContain('In arrivo');
  });
});
