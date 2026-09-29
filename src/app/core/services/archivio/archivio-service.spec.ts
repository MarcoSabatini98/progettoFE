import { TestBed } from '@angular/core/testing';

import { ArchivioService } from './archivio-service';

describe('ArchivioService', () => {
  let servizio: ArchivioService;

  beforeEach(() => {
    localStorage.clear();
    servizio = TestBed.inject(ArchivioService);
  });

  it('legge un valore ammesso salvato in precedenza', () => {
    servizio.scrivi('chiave', 'b');
    expect(servizio.leggi('chiave', ['a', 'b'])).toBe('b');
  });

  it('ignora un valore non ammesso', () => {
    localStorage.setItem('chiave', 'manomesso');
    expect(servizio.leggi('chiave', ['a', 'b'])).toBeNull();
  });

  it('restituisce null se la chiave non esiste', () => {
    expect(servizio.leggi('assente', ['a'])).toBeNull();
  });
});
