import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Data,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { describe, expect, it, vi } from 'vitest';

import { AuthService } from './auth-service';
import { ruoloGuard } from './ruolo-guard';

// La regola ruoli/permessi è testata in AuthService.puoAccedere: qui solo l'esito della guardia.
const esegui = (ammesso: boolean, data: Data = {}) => {
  const puoAccedere = vi.fn(() => ammesso);
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: AuthService, useValue: { puoAccedere } }],
  });
  const esito = TestBed.runInInjectionContext(() =>
    ruoloGuard({ data } as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
  );
  return { esito, puoAccedere };
};

describe('ruoloGuard', () => {
  it('passa i requisiti della rotta ad AuthService', () => {
    const { esito, puoAccedere } = esegui(true, { ruoli: ['admin'] });

    expect(esito).toBe(true);
    expect(puoAccedere).toHaveBeenCalledWith({ ruoli: ['admin'] });
  });

  it('senza i requisiti rimanda alla home', () => {
    const esito = esegui(false).esito as UrlTree;

    expect(esito).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(esito)).toBe('/');
  });
});
