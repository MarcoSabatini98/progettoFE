import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Translation, TranslocoLoader } from '@jsverse/transloco';

import { PERCORSO_TRADUZIONI } from '../costanti/lingue-costanti';

/** Scarica public/i18n/<lingua>.json. */
@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private readonly http = inject(HttpClient);

  getTranslation(lingua: string) {
    return this.http.get<Translation>(`${PERCORSO_TRADUZIONI}/${lingua}.json`);
  }
}
