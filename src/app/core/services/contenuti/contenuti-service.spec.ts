import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../../environments/environment';
import { configuraHttpTest, risposta } from '../api/configura-http-test';
import { ContenutiService, eVideo } from './contenuti-service';

const API = `${environment.apiUrl}/contenuti`;

describe('ContenutiService', () => {
  let service: ContenutiService;
  let backend: HttpTestingController;

  beforeEach(() => {
    backend = configuraHttpTest();
    service = TestBed.inject(ContenutiService);
  });

  afterEach(() => backend.verify());

  it('legge il documento legale vigente nella lingua richiesta', () => {
    service.leggiDocumentoVigente('privacy', 'en').subscribe();

    const richiesta = backend.expectOne(
      (req) => req.url === `${API}/documenti-legali/vigente/privacy`,
    );
    expect(richiesta.request.params.get('lingua')).toBe('en');
    richiesta.flush(risposta({}));
  });

  it('legge una pagina del sito nella lingua richiesta', () => {
    service.leggiPaginaPubblica('struttura', 'de').subscribe();

    const richiesta = backend.expectOne((req) => req.url === `${API}/pagine/struttura/pubblica`);
    expect(richiesta.request.params.get('lingua')).toBe('de');
    richiesta.flush(risposta({}));
  });

  it('crea una sezione sulla pagina indicata', () => {
    service.creaSezione({ pagina_id: 2, titolo: 'Il giardino', testo: 'Ulivi' }).subscribe();

    const richiesta = backend.expectOne(`${API}/sezioni`);
    expect(richiesta.request.method).toBe('POST');
    expect(richiesta.request.body).toMatchObject({ pagina_id: 2 });
    richiesta.flush(risposta({}));
  });

  it('salva le traduzioni di un record', () => {
    service.salvaTraduzioni('faq', 3, { en: { domanda: 'Check-in time?' } }).subscribe();

    const richiesta = backend.expectOne(`${API}/traduzioni/faq/3`);
    expect(richiesta.request.method).toBe('PUT');
    richiesta.flush(risposta({ en: { domanda: 'Check-in time?' } }));
  });

  it("carica un'immagine come multipart", () => {
    const file = new File(['x'], 'foto.jpg', { type: 'image/jpeg' });
    service.caricaMedia({ entita: 'camera', entita_id: 4, file }).subscribe();

    const richiesta = backend.expectOne(`${API}/media`);
    const corpo = richiesta.request.body as FormData;
    expect(corpo.get('entita_id')).toBe('4');
    expect(corpo.get('file')).toBeInstanceOf(File);
    richiesta.flush(risposta({}));
  });

  it('riordina le immagini inviando gli id in sequenza', () => {
    service.riordinaMedia([3, 1, 2]).subscribe();

    const richiesta = backend.expectOne(`${API}/media/ordine`);
    expect(richiesta.request.body).toEqual({ ids: [3, 1, 2] });
    richiesta.flush(risposta(null));
  });

  it('pubblica un documento legale in bozza', () => {
    service.pubblicaDocumentoLegale(7).subscribe();

    const richiesta = backend.expectOne(`${API}/documenti-legali/7/pubblicazione`);
    expect(richiesta.request.method).toBe('POST');
    richiesta.flush(risposta({}));
  });
});

describe('eVideo', () => {
  it('riconosce i video dal tipo MIME', () => {
    expect(eVideo({ tipo_mime: 'video/mp4' })).toBe(true);
    expect(eVideo({ tipo_mime: 'image/webp' })).toBe(false);
  });
});
