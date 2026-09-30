import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslocoService, TranslocoTestingModule } from '@jsverse/transloco';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { risposta } from '../api/configura-http-test';
import { CHIAVI_ARCHIVIO } from '../archivio/archivio-costanti';
import { ImpostazioniService } from '../impostazioni/impostazioni-service';
import { LINGUE } from './lingua-costanti';
import { LinguaService } from './lingua-service';
import { CONFIG_TRANSLOCO } from './transloco-config';

describe('LinguaService', () => {
  // Crea il servizio simulando la lingua impostata nel browser.
  function crea(linguaBrowser = 'de-DE'): LinguaService {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue(linguaBrowser);
    TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: Object.fromEntries(LINGUE.map((lingua) => [lingua, {}])),
          translocoConfig: CONFIG_TRANSLOCO,
        }),
      ],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    return TestBed.inject(LinguaService);
  }

  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('should be created', () => {
    expect(crea()).toBeTruthy();
  });

  it('usa la lingua del browser se supportata', () => {
    expect(crea('de-DE').attiva()).toBe('de');
    expect(document.documentElement.lang).toBe('de');
  });

  it("ripiega sull'italiano se la lingua del browser non è supportata", () => {
    expect(crea('ja-JP').attiva()).toBe('it');
  });

  it('preferisce la lingua salvata a quella del browser', () => {
    localStorage.setItem(CHIAVI_ARCHIVIO.lingua, 'es');
    expect(crea('de-DE').attiva()).toBe('es');
  });

  it('imposta la lingua in Transloco, sul documento e in archivio', () => {
    const service = crea();

    service.imposta('fr');

    expect(service.attiva()).toBe('fr');
    expect(TestBed.inject(TranslocoService).getActiveLang()).toBe('fr');
    expect(document.documentElement.lang).toBe('fr');
    expect(localStorage.getItem(CHIAVI_ARCHIVIO.lingua)).toBe('fr');
  });

  it("offre solo le lingue attivate dall'admin, nell'ordine del selettore", () => {
    const service = crea();
    expect(service.disponibili()).toEqual(LINGUE);

    TestBed.inject(ImpostazioniService).leggiPubbliche().subscribe();
    TestBed.inject(HttpTestingController)
      .expectOne((req) => req.url.endsWith('/impostazioni/pubbliche'))
      .flush(risposta({ lingue_attive: ['en', 'it'] }));

    expect(service.disponibili()).toEqual(['it', 'en']);
  });
});
