import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { PARAMETRO_RITORNO, PERCORSI_AUTH } from './auth-costanti';
import { AuthService } from './auth-service';

/** Rotte per utenti collegati: gli altri vanno all'accesso e poi tornano qui. */
export const authGuard: CanActivateFn = (_rotta, stato) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return (
    auth.collegato() ||
    router.createUrlTree([PERCORSI_AUTH.accesso], {
      queryParams: { [PARAMETRO_RITORNO]: stato.url },
    })
  );
};
