import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TranslocoHttpLoader } from './transloco-loader';

describe('TranslocoHttpLoader', () => {
  it('scarica il file della lingua richiesta', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const http = TestBed.inject(HttpTestingController);
    let ricevuto: unknown;

    TestBed.inject(TranslocoHttpLoader)
      .getTranslation('fr')
      .subscribe((traduzioni) => (ricevuto = traduzioni));
    http.expectOne('i18n/fr.json').flush({ ciao: 'salut' });

    expect(ricevuto).toEqual({ ciao: 'salut' });
    http.verify();
  });
});
