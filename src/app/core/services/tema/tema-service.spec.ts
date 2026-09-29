import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { CHIAVI_ARCHIVIO } from '../archivio/archivio-costanti';
import { ATTRIBUTO_TEMA } from './tema-costanti';
import { TemaService } from './tema-service';

describe('TemaService', () => {
  const radice = document.documentElement;

  beforeEach(() => {
    localStorage.clear();
    radice.removeAttribute(ATTRIBUTO_TEMA);
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(TestBed.inject(TemaService)).toBeTruthy();
  });

  it('parte da "sistema" senza forzare il tema', () => {
    const service = TestBed.inject(TemaService);
    expect(service.preferenza()).toBe('sistema');
    expect(radice.hasAttribute(ATTRIBUTO_TEMA)).toBe(false);
  });

  it('ripristina la preferenza salvata', () => {
    localStorage.setItem(CHIAVI_ARCHIVIO.tema, 'scuro');
    const service = TestBed.inject(TemaService);
    expect(service.preferenza()).toBe('scuro');
    expect(radice.getAttribute(ATTRIBUTO_TEMA)).toBe('scuro');
  });

  it('imposta, salva e poi torna al tema di sistema', () => {
    const service = TestBed.inject(TemaService);

    service.imposta('chiaro');
    expect(radice.getAttribute(ATTRIBUTO_TEMA)).toBe('chiaro');
    expect(localStorage.getItem(CHIAVI_ARCHIVIO.tema)).toBe('chiaro');

    // Tornando a "sistema" l'attributo sparisce e decide il dispositivo.
    service.imposta('sistema');
    expect(radice.hasAttribute(ATTRIBUTO_TEMA)).toBe(false);
  });
});
