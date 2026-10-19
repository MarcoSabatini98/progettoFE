import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';

import { traduzioniTest } from '../../core/services/lingua/configura-transloco-test';
import { PaginaNonTrovataComponent } from './pagina-non-trovata-component';

describe('PaginaNonTrovataComponent', () => {
  it('spiega il problema e riporta alla home', async () => {
    TestBed.configureTestingModule({
      imports: [traduzioniTest({ nonTrovata: { titolo: 'Pagina non trovata' } })],
      providers: [provideRouter([])],
    });
    const fixture = TestBed.createComponent(PaginaNonTrovataComponent);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;

    expect(elemento.querySelector('h1')?.textContent).toBe('Pagina non trovata');
    expect(elemento.querySelector('a')?.getAttribute('href')).toBe('/');
  });
});
