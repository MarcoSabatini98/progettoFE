import { TestBed } from '@angular/core/testing';
import { TranslocoService, TranslocoTestingModule } from '@jsverse/transloco';

import { CHIAVI_ARCHIVIO } from '../../costanti/archiviazione-costanti';
import { LINGUE } from '../../costanti/lingue-costanti';
import { CONFIG_TRANSLOCO } from '../../i18n/transloco-config';
import { LinguaService } from './lingua-service';

describe('LinguaService', () => {
  function crea(linguaBrowser = 'de-DE') {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue(linguaBrowser);
    TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: Object.fromEntries(LINGUE.map((lingua) => [lingua, {}])),
          translocoConfig: CONFIG_TRANSLOCO,
        }),
      ],
    });
    return TestBed.inject(LinguaService);
  }

  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

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
    const servizio = crea();

    servizio.imposta('fr');

    expect(servizio.attiva()).toBe('fr');
    expect(TestBed.inject(TranslocoService).getActiveLang()).toBe('fr');
    expect(document.documentElement.lang).toBe('fr');
    expect(localStorage.getItem(CHIAVI_ARCHIVIO.lingua)).toBe('fr');
  });
});
