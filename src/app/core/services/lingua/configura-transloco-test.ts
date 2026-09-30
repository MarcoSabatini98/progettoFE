import { ModuleWithProviders } from '@angular/core';
import { Translation, TranslocoTestingModule } from '@jsverse/transloco';

import { LINGUA_PREDEFINITA } from './lingua-costanti';
import { CONFIG_TRANSLOCO } from './transloco-config';

/**
 * Solo per i test: Transloco già caricato in italiano. Senza testi le chiavi
 * restano visibili così come sono (es. "menu.esci").
 */
export function traduzioniTest(
  testi: Translation = {},
): ModuleWithProviders<TranslocoTestingModule> {
  return TranslocoTestingModule.forRoot({
    langs: { [LINGUA_PREDEFINITA]: testi },
    translocoConfig: CONFIG_TRANSLOCO,
    preloadLangs: true,
  });
}
