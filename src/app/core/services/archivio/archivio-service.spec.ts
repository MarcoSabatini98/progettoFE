import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ArchivioService } from './archivio-service';

describe('ArchivioService', () => {
  let service: ArchivioService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArchivioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('legge un valore ammesso salvato in precedenza', () => {
    service.scrivi('chiave', 'b');
    expect(service.leggi('chiave', ['a', 'b'])).toBe('b');
  });

  it('ignora un valore non ammesso', () => {
    // Simula un valore modificato a mano dal browser o rimasto da una versione precedente.
    localStorage.setItem('chiave', 'manomesso');
    expect(service.leggi('chiave', ['a', 'b'])).toBeNull();
  });

  it('restituisce null se la chiave non esiste', () => {
    expect(service.leggi('assente', ['a'])).toBeNull();
  });
});
