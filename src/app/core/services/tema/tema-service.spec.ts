import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../../environments/environment';
import { CHIAVI_ARCHIVIO } from '../archivio/archivio-costanti';
import { ImpostazioniService } from '../impostazioni/impostazioni-service';
import { ATTRIBUTO_TEMA, BRAND_PREDEFINITO, TESTO_SU_BRAND } from './tema-costanti';
import { TemaService, iconaIniziali, testoSuBrand } from './tema-service';

describe('TemaService', () => {
  const radice = document.documentElement;
  const pubbliche = signal<Record<string, string>>({});

  beforeEach(() => {
    localStorage.clear();
    pubbliche.set({});
    radice.removeAttribute(ATTRIBUTO_TEMA);
    radice.removeAttribute('style');
    if (!document.querySelector('link[rel="icon"]')) {
      document.head.append(Object.assign(document.createElement('link'), { rel: 'icon' }));
    }
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ImpostazioniService,
          useValue: { testo: (chiave: string) => pubbliche()[chiave] ?? '' },
        },
      ],
    });
  });

  function crea() {
    const service = TestBed.inject(TemaService);
    TestBed.tick();
    return service;
  }

  it('parte da "sistema" senza forzare il tema né il colore', () => {
    const service = crea();
    expect(service.preferenza()).toBe('sistema');
    expect(radice.hasAttribute(ATTRIBUTO_TEMA)).toBe(false);
    expect(radice.style.getPropertyValue('--bb-brand')).toBe('');
  });

  it('ripristina la preferenza salvata', () => {
    localStorage.setItem(CHIAVI_ARCHIVIO.tema, 'scuro');
    const service = crea();
    expect(service.preferenza()).toBe('scuro');
    expect(radice.getAttribute(ATTRIBUTO_TEMA)).toBe('scuro');
  });

  it('imposta, salva e poi torna al tema di sistema', () => {
    const service = crea();

    service.imposta('chiaro');
    TestBed.tick();
    expect(radice.getAttribute(ATTRIBUTO_TEMA)).toBe('chiaro');
    expect(localStorage.getItem(CHIAVI_ARCHIVIO.tema)).toBe('chiaro');

    // Tornando a "sistema" l'attributo sparisce e decide il dispositivo.
    service.imposta('sistema');
    TestBed.tick();
    expect(radice.hasAttribute(ATTRIBUTO_TEMA)).toBe(false);
  });

  it('senza scelta sul dispositivo vale il tema della struttura', () => {
    const service = crea();

    pubbliche.set({ aspetto_tema: 'scuro' });
    TestBed.tick();
    expect(service.preferenza()).toBe('scuro');

    service.imposta('chiaro');
    TestBed.tick();
    expect(radice.getAttribute(ATTRIBUTO_TEMA)).toBe('chiaro');
  });

  it('ignora un tema della struttura non valido', () => {
    pubbliche.set({ aspetto_tema: 'blu' });
    expect(crea().preferenza()).toBe('sistema');
  });

  it('applica il colore della struttura e lo toglie se non valido', () => {
    crea();

    pubbliche.set({ aspetto_colore: '#f5e6a0' });
    TestBed.tick();
    expect(radice.style.getPropertyValue('--bb-brand')).toBe('#f5e6a0');
    expect(radice.style.getPropertyValue('--bb-su-brand')).toBe(TESTO_SU_BRAND.scuro);

    pubbliche.set({ aspetto_colore: 'verde' });
    TestBed.tick();
    expect(radice.style.getPropertyValue('--bb-brand')).toBe('');
  });

  it('la favicon è il logo; senza logo le iniziali nel colore della struttura', () => {
    const icona = () => document.querySelector<HTMLLinkElement>('link[rel="icon"]')!.href;
    pubbliche.set({ struttura_nome: 'Hotel Prova', aspetto_colore: '#123456' });
    crea();
    expect(icona()).toBe(iconaIniziali('HP', '#123456'));

    pubbliche.set({ struttura_nome: 'Hotel Prova', aspetto_logo: 'media/logo.png' });
    TestBed.tick();
    expect(icona()).toContain(`${environment.mediaUrl}/media/logo.png`);
  });
});

describe('iconaIniziali', () => {
  it("disegna l'arco con le iniziali, testo XML sicuro", () => {
    const svg = decodeURIComponent(iconaIniziali('B&', BRAND_PREDEFINITO));
    expect(svg.startsWith('data:image/svg+xml,<svg')).toBe(true);
    expect(svg).toContain(`fill="${BRAND_PREDEFINITO}"`);
    expect(svg).toContain('>B&#38;</text>');
  });
});

describe('testoSuBrand', () => {
  it('bianco sui colori scuri, scuro sui chiari', () => {
    expect(testoSuBrand('#5e6b3a')).toBe(TESTO_SU_BRAND.chiaro);
    expect(testoSuBrand('#FFFFFF')).toBe(TESTO_SU_BRAND.scuro);
  });
});
