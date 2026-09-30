import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { RequisitiAccessoInterface } from '../../../shared/models/requisiti-accesso/requisiti-accesso-model';
import { PERCORSI_PUBBLICI } from '../navigazione/navigazione-costanti';
import { AuthService } from './auth-service';

/**
 * Rotte riservate, da mettere dopo authGuard.
 * route.data è un RequisitiAccessoInterface: ruoli (basta uno) e permessi (servono tutti).
 */
export const ruoloGuard: CanActivateFn = (rotta) => {
  const router = inject(Router);
  const ammesso = inject(AuthService).puoAccedere(rotta.data as RequisitiAccessoInterface);
  return ammesso || router.createUrlTree([PERCORSI_PUBBLICI.home]);
};
