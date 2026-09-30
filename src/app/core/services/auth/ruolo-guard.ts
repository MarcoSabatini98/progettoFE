import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { CodicePermesso } from '../../../shared/models/permesso/permesso-model';
import { CodiceRuolo } from '../../../shared/models/ruolo/ruolo-model';
import { DATI_ROTTA, PERCORSI_AUTH } from './auth-costanti';
import { AuthService } from './auth-service';

/**
 * Rotte riservate, da mettere dopo authGuard.
 * data.ruoli: basta uno dei ruoli; data.permessi: servono tutti.
 */
export const ruoloGuard: CanActivateFn = (rotta) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const ruoli = rotta.data[DATI_ROTTA.ruoli] as CodiceRuolo[] | undefined;
  const permessi = rotta.data[DATI_ROTTA.permessi] as CodicePermesso[] | undefined;
  const ammesso = (!ruoli || auth.haRuolo(ruoli)) && (!permessi || auth.haPermessi(permessi));
  return ammesso || router.createUrlTree([PERCORSI_AUTH.home]);
};
