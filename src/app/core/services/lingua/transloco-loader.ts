import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { Observable } from 'rxjs';

import { PERCORSO_TRADUZIONI } from './lingua-costanti';

@Injectable({
  providedIn: 'root',
})
export class TranslocoHttpLoader implements TranslocoLoader {
  private readonly http = inject(HttpClient);

  /**
   * GET public/i18n/<lingua>.json
   */
  getTranslation(lingua: string): Observable<Translation> {
    return this.http.get<Translation>(`${PERCORSO_TRADUZIONI}/${lingua}.json`);
  }
}
