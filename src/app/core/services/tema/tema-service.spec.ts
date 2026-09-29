import { TestBed } from '@angular/core/testing';

import { CHIAVI_ARCHIVIO } from '../../costanti/archiviazione-costanti';
import { ATTRIBUTO_TEMA } from '../../costanti/tema-costanti';
import { TemaService } from './tema-service';

describe('TemaService', () => {
  const radice = document.documentElement;

  beforeEach(() => {
    localStorage.clear();
    radice.removeAttribute(ATTRIBUTO_TEMA);
  });

  it('parte da "sistema" senza forzare il tema', () => {
    const servizio = TestBed.inject(TemaService);
    expect(servizio.preferenza()).toBe('sistema');
    expect(radice.hasAttribute(ATTRIBUTO_TEMA)).toBe(false);
  });

  it('ripristina la preferenza salvata', () => {
    localStorage.setItem(CHIAVI_ARCHIVIO.tema, 'scuro');
    const servizio = TestBed.inject(TemaService);
    expect(servizio.preferenza()).toBe('scuro');
    expect(radice.getAttribute(ATTRIBUTO_TEMA)).toBe('scuro');
  });

  it('imposta, salva e poi torna al tema di sistema', () => {
    const servizio = TestBed.inject(TemaService);

    servizio.imposta('chiaro');
    expect(radice.getAttribute(ATTRIBUTO_TEMA)).toBe('chiaro');
    expect(localStorage.getItem(CHIAVI_ARCHIVIO.tema)).toBe('chiaro');

    servizio.imposta('sistema');
    expect(radice.hasAttribute(ATTRIBUTO_TEMA)).toBe(false);
  });
});
