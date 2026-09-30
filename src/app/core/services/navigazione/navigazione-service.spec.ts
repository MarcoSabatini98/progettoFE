import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { CodicePermesso } from '../../../shared/models/permesso/permesso-model';
import { RequisitiAccessoInterface } from '../../../shared/models/requisiti-accesso/requisiti-accesso-model';
import { CodiceRuolo } from '../../../shared/models/ruolo/ruolo-model';
import { AuthService } from '../auth/auth-service';
import { PERCORSI_PUBBLICI, PERCORSO_STAFF } from './navigazione-costanti';
import { NavigazioneService } from './navigazione-service';

describe('NavigazioneService', () => {
  // AuthService finto: stessa regola di accesso, utente modificabile dal test.
  function crea(ruolo: CodiceRuolo | null, permessi: CodicePermesso[] = []) {
    const utente = signal(ruolo ? { ruolo, permessi } : null);
    const haRuolo = (ruoli: readonly CodiceRuolo[]) => ruoli.some((r) => r === utente()?.ruolo);
    const haPermessi = (richiesti: readonly CodicePermesso[]) =>
      richiesti.every((permesso) => utente()?.permessi.includes(permesso));
    const auth = {
      haRuolo,
      puoAccedere: ({ ruoli, permessi: richiesti }: RequisitiAccessoInterface) =>
        (!ruoli || haRuolo(ruoli)) && (!richiesti || haPermessi(richiesti)),
    };
    TestBed.configureTestingModule({ providers: [{ provide: AuthService, useValue: auth }] });
    return { service: TestBed.inject(NavigazioneService), utente };
  }

  it('mostra alla governante solo le voci permesse, senza gruppi vuoti', () => {
    const { service } = crea('housekeeper', ['pulizie.leggi', 'manutenzione.segnala']);

    expect(service.menuStaff().map((gruppo) => gruppo.voci.map((voce) => voce.percorso))).toEqual([
      [`${PERCORSO_STAFF}/pulizie`, `${PERCORSO_STAFF}/chat`, `${PERCORSO_STAFF}/manutenzione`],
    ]);
    expect(service.primaPaginaStaff()).toBe(`${PERCORSO_STAFF}/pulizie`);
  });

  it('le voci riservate al ruolo admin compaiono solo all’admin', () => {
    const { service } = crea('admin');
    const percorsi = service.menuStaff().flatMap((gruppo) => gruppo.voci.map((v) => v.percorso));

    expect(percorsi).toContain(`${PERCORSO_STAFF}/registro`);
    expect(percorsi).not.toContain(`${PERCORSO_STAFF}/pulizie`);
  });

  it('manda lo staff al gestionale e i clienti al sito', () => {
    const { service, utente } = crea('receptionist');
    expect(service.paginaIniziale()).toBe(PERCORSO_STAFF);

    utente.set({ ruolo: 'cliente', permessi: [] });
    expect(service.staff()).toBe(false);
    expect(service.paginaIniziale()).toBe(PERCORSI_PUBBLICI.home);
  });
});
