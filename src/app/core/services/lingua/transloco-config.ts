import { isDevMode } from '@angular/core';
import { translocoConfig } from '@jsverse/transloco';

import { LINGUA_PREDEFINITA, LINGUE } from './lingua-costanti';

/** Configurazione unica di Transloco, condivisa tra app e test. */
export const CONFIG_TRANSLOCO = translocoConfig({
  availableLangs: [...LINGUE],
  defaultLang: LINGUA_PREDEFINITA,
  fallbackLang: LINGUA_PREDEFINITA,
  missingHandler: { useFallbackTranslation: true },
  reRenderOnLangChange: true,
  prodMode: !isDevMode(),
});
