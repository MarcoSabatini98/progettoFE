import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { describe, expect, it } from 'vitest';

import { authGuard } from './auth-guard';
import { AuthService } from './auth-service';

const esegui = (collegato: boolean) => {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: AuthService, useValue: { collegato: signal(collegato) } },
    ],
  });
  return TestBed.runInInjectionContext(() =>
    authGuard({} as ActivatedRouteSnapshot, { url: '/area/prenotazioni' } as RouterStateSnapshot),
  );
};

describe('authGuard', () => {
  it("lascia passare l'utente collegato", () => {
    expect(esegui(true)).toBe(true);
  });

  it("manda all'accesso chi non è collegato, ricordando la pagina", () => {
    const esito = esegui(false) as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(esito)).toBe(
      '/accesso?ritorno=%2Farea%2Fprenotazioni',
    );
  });
});
