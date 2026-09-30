import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Data,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { describe, expect, it } from 'vitest';

import { CodicePermesso } from '../../../shared/models/permesso/permesso-model';
import { CodiceRuolo } from '../../../shared/models/ruolo/ruolo-model';
import { AuthService } from './auth-service';
import { ruoloGuard } from './ruolo-guard';

const UTENTE = { ruolo: 'receptionist' as CodiceRuolo, permessi: ['prenotazioni.leggi'] };

const esegui = (data: Data) => {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      {
        provide: AuthService,
        useValue: {
          haRuolo: (ruoli: CodiceRuolo[]) => ruoli.includes(UTENTE.ruolo),
          haPermessi: (permessi: CodicePermesso[]) =>
            permessi.every((permesso) => UTENTE.permessi.includes(permesso)),
        },
      },
    ],
  });
  return TestBed.runInInjectionContext(() =>
    ruoloGuard({ data } as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
  );
};

describe('ruoloGuard', () => {
  it('senza requisiti lascia passare', () => {
    expect(esegui({})).toBe(true);
  });

  it('passa con i permessi richiesti', () => {
    expect(esegui({ permessi: ['prenotazioni.leggi'] })).toBe(true);
  });

  it('basta uno dei ruoli richiesti', () => {
    expect(esegui({ ruoli: ['admin', 'receptionist'] })).toBe(true);
  });

  it('servono tutti i permessi richiesti', () => {
    expect(esegui({ permessi: ['prenotazioni.leggi', 'tariffe.gestisci'] })).toBeInstanceOf(
      UrlTree,
    );
  });

  it('senza il ruolo rimanda alla home', () => {
    const esito = esegui({ ruoli: ['admin'] }) as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(esito)).toBe('/');
  });
});
