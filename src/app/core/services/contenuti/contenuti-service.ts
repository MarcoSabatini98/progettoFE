import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  DocumentoLegaleAggiornaPayload,
  DocumentoLegaleCreaPayload,
  DocumentoLegaleInterface,
  FiltriDocumentiLegali,
  TipoDocumentoLegale,
} from '../../../shared/models/documento-legale/documento-legale-model';
import {
  EventoSpecialeAggiornaPayload,
  EventoSpecialeCreaPayload,
  EventoSpecialeInterface,
  EventoPubblicoInterface,
  FiltriEventi,
} from '../../../shared/models/evento-speciale/evento-speciale-model';
import {
  FaqAggiornaPayload,
  FaqCreaPayload,
  FaqInterface,
  FiltriFaq,
} from '../../../shared/models/faq/faq-model';
import { Lingua } from '../../../shared/models/lingua/lingua-model';
import {
  FiltriMedia,
  MediaAggiornaPayload,
  MediaCreaPayload,
  MediaInterface,
} from '../../../shared/models/media/media-model';
import {
  ChiavePagina,
  PaginaSitoAggiornaPayload,
  PaginaSitoInterface,
} from '../../../shared/models/pagina-sito/pagina-sito-model';
import { RispostaApiInterface } from '../../../shared/models/risposta-api/risposta-api-model';
import {
  EntitaTraducibile,
  TraduzioniPayload,
  TraduzioniPerLinguaInterface,
} from '../../../shared/models/traduzione/traduzione-model';
import {
  SezioneAggiornaPayload,
  SezioneCreaPayload,
  SezioneInterface,
} from '../../../shared/models/sezione/sezione-model';
import { creaFormDati } from '../api/form-dati';
import { creaParametri } from '../api/parametri-http';

/**
 * È VIDEO
 * Il media va mostrato con <video> invece che con <img>.
 */
export function eVideo(media: Pick<MediaInterface, 'tipo_mime'>): boolean {
  return media.tipo_mime.startsWith('video/');
}

/**
 * Contenuti del sito: immagini, FAQ, pagine e sezioni, documenti legali, eventi in zona e traduzioni.
 */
@Injectable({
  providedIn: 'root',
})
export class ContenutiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/contenuti`;

  // ─── Sito pubblico ───

  /**
   * FAQ PUBBLICHE — GET /faq/pubbliche
   * Senza lingua vale l'italiano.
   */
  elencaFaqPubbliche(lingua?: Lingua): Observable<FaqInterface[]> {
    return this.http
      .get<RispostaApiInterface<FaqInterface[]>>(`${this.apiUrl}/faq/pubbliche`, {
        params: creaParametri({ lingua }),
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * EVENTI PUBBLICI — GET /eventi/pubblici
   * In corso o nei prossimi giorni, col titolo nella lingua richiesta.
   */
  elencaEventiPubblici(lingua?: Lingua): Observable<EventoPubblicoInterface[]> {
    return this.http
      .get<RispostaApiInterface<EventoPubblicoInterface[]>>(`${this.apiUrl}/eventi/pubblici`, {
        params: creaParametri({ lingua }),
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * DOCUMENTO VIGENTE — GET /documenti-legali/vigente/:tipo
   */
  leggiDocumentoVigente(
    tipo: TipoDocumentoLegale,
    lingua?: Lingua,
  ): Observable<DocumentoLegaleInterface> {
    return this.http
      .get<RispostaApiInterface<DocumentoLegaleInterface>>(
        `${this.apiUrl}/documenti-legali/vigente/${tipo}`,
        { params: creaParametri({ lingua }) },
      )
      .pipe(map((res) => res.dati));
  }

  /**
   * PAGINA DEL SITO — GET /pagine/:chiave/pubblica
   * Copertina, descrizione e sezioni pubblicate.
   */
  leggiPaginaPubblica(chiave: ChiavePagina, lingua?: Lingua): Observable<PaginaSitoInterface> {
    return this.http
      .get<RispostaApiInterface<PaginaSitoInterface>>(`${this.apiUrl}/pagine/${chiave}/pubblica`, {
        params: creaParametri({ lingua }),
      })
      .pipe(map((res) => res.dati));
  }

  // ─── Traduzioni ───

  /**
   * TRADUZIONI — GET /traduzioni/:entita/:entitaId
   */
  leggiTraduzioni(
    entita: EntitaTraducibile,
    entitaId: number,
  ): Observable<TraduzioniPerLinguaInterface> {
    return this.http
      .get<RispostaApiInterface<TraduzioniPerLinguaInterface>>(
        `${this.apiUrl}/traduzioni/${entita}/${entitaId}`,
      )
      .pipe(map((res) => res.dati));
  }

  /**
   * SALVA TRADUZIONI — PUT /traduzioni/:entita/:entitaId
   */
  salvaTraduzioni(
    entita: EntitaTraducibile,
    entitaId: number,
    dati: TraduzioniPayload,
  ): Observable<TraduzioniPerLinguaInterface> {
    return this.http
      .put<RispostaApiInterface<TraduzioniPerLinguaInterface>>(
        `${this.apiUrl}/traduzioni/${entita}/${entitaId}`,
        dati,
      )
      .pipe(map((res) => res.dati));
  }

  // ─── Immagini ───

  /**
   * IMMAGINI — GET /media
   * Pubblico: serve alle gallerie del sito.
   */
  elencaMedia(filtri: FiltriMedia): Observable<MediaInterface[]> {
    return this.http
      .get<RispostaApiInterface<MediaInterface[]>>(`${this.apiUrl}/media`, {
        params: creaParametri(filtri),
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * CARICA IMMAGINE — POST /media (multipart)
   */
  caricaMedia(dati: MediaCreaPayload): Observable<MediaInterface> {
    return this.http
      .post<RispostaApiInterface<MediaInterface>>(`${this.apiUrl}/media`, creaFormDati(dati))
      .pipe(map((res) => res.dati));
  }

  /**
   * RIORDINA — PUT /media/ordine
   * ids nella sequenza voluta.
   */
  riordinaMedia(ids: number[]): Observable<null> {
    return this.http
      .put<RispostaApiInterface<null>>(`${this.apiUrl}/media/ordine`, { ids })
      .pipe(map((res) => res.dati));
  }

  /**
   * AGGIORNA IMMAGINE — PATCH /media/:id
   */
  aggiornaMedia(id: number, dati: MediaAggiornaPayload): Observable<MediaInterface> {
    return this.http
      .patch<RispostaApiInterface<MediaInterface>>(`${this.apiUrl}/media/${id}`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * ELIMINA IMMAGINE — DELETE /media/:id
   */
  eliminaMedia(id: number): Observable<null> {
    return this.http
      .delete<RispostaApiInterface<null>>(`${this.apiUrl}/media/${id}`)
      .pipe(map((res) => res.dati));
  }

  // ─── FAQ ───

  /**
   * FAQ — GET /faq
   */
  elencaFaq(filtri: FiltriFaq = {}): Observable<FaqInterface[]> {
    return this.http
      .get<RispostaApiInterface<FaqInterface[]>>(`${this.apiUrl}/faq`, {
        params: creaParametri(filtri),
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * CREA FAQ — POST /faq
   */
  creaFaq(dati: FaqCreaPayload): Observable<FaqInterface> {
    return this.http
      .post<RispostaApiInterface<FaqInterface>>(`${this.apiUrl}/faq`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * DETTAGLIO FAQ — GET /faq/:id
   * Con autore e traduzioni.
   */
  leggiFaq(id: number): Observable<FaqInterface> {
    return this.http
      .get<RispostaApiInterface<FaqInterface>>(`${this.apiUrl}/faq/${id}`)
      .pipe(map((res) => res.dati));
  }

  /**
   * AGGIORNA FAQ — PATCH /faq/:id
   */
  aggiornaFaq(id: number, dati: FaqAggiornaPayload): Observable<FaqInterface> {
    return this.http
      .patch<RispostaApiInterface<FaqInterface>>(`${this.apiUrl}/faq/${id}`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * ELIMINA FAQ — DELETE /faq/:id
   */
  eliminaFaq(id: number): Observable<null> {
    return this.http
      .delete<RispostaApiInterface<null>>(`${this.apiUrl}/faq/${id}`)
      .pipe(map((res) => res.dati));
  }

  // ─── Pagine e sezioni ───

  /**
   * PAGINE — GET /pagine
   * Tutte, con copertina e sezioni (anche quelle nascoste).
   */
  elencaPagine(): Observable<PaginaSitoInterface[]> {
    return this.http
      .get<RispostaApiInterface<PaginaSitoInterface[]>>(`${this.apiUrl}/pagine`)
      .pipe(map((res) => res.dati));
  }

  /**
   * AGGIORNA PAGINA — PATCH /pagine/:id
   */
  aggiornaPagina(id: number, dati: PaginaSitoAggiornaPayload): Observable<PaginaSitoInterface> {
    return this.http
      .patch<RispostaApiInterface<PaginaSitoInterface>>(`${this.apiUrl}/pagine/${id}`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * CREA SEZIONE — POST /sezioni
   */
  creaSezione(dati: SezioneCreaPayload): Observable<SezioneInterface> {
    return this.http
      .post<RispostaApiInterface<SezioneInterface>>(`${this.apiUrl}/sezioni`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * AGGIORNA SEZIONE — PATCH /sezioni/:id
   */
  aggiornaSezione(id: number, dati: SezioneAggiornaPayload): Observable<SezioneInterface> {
    return this.http
      .patch<RispostaApiInterface<SezioneInterface>>(`${this.apiUrl}/sezioni/${id}`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * ELIMINA SEZIONE — DELETE /sezioni/:id
   * Con la sua immagine e le traduzioni.
   */
  eliminaSezione(id: number): Observable<null> {
    return this.http
      .delete<RispostaApiInterface<null>>(`${this.apiUrl}/sezioni/${id}`)
      .pipe(map((res) => res.dati));
  }

  // ─── Documenti legali ───

  /**
   * DOCUMENTI — GET /documenti-legali
   */
  elencaDocumentiLegali(
    filtri: FiltriDocumentiLegali = {},
  ): Observable<DocumentoLegaleInterface[]> {
    return this.http
      .get<RispostaApiInterface<DocumentoLegaleInterface[]>>(`${this.apiUrl}/documenti-legali`, {
        params: creaParametri(filtri),
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * CREA DOCUMENTO — POST /documenti-legali
   */
  creaDocumentoLegale(dati: DocumentoLegaleCreaPayload): Observable<DocumentoLegaleInterface> {
    return this.http
      .post<RispostaApiInterface<DocumentoLegaleInterface>>(`${this.apiUrl}/documenti-legali`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * DETTAGLIO DOCUMENTO — GET /documenti-legali/:id
   */
  leggiDocumentoLegale(id: number): Observable<DocumentoLegaleInterface> {
    return this.http
      .get<RispostaApiInterface<DocumentoLegaleInterface>>(`${this.apiUrl}/documenti-legali/${id}`)
      .pipe(map((res) => res.dati));
  }

  /**
   * AGGIORNA DOCUMENTO — PATCH /documenti-legali/:id
   * Solo le bozze.
   */
  aggiornaDocumentoLegale(
    id: number,
    dati: DocumentoLegaleAggiornaPayload,
  ): Observable<DocumentoLegaleInterface> {
    return this.http
      .patch<RispostaApiInterface<DocumentoLegaleInterface>>(
        `${this.apiUrl}/documenti-legali/${id}`,
        dati,
      )
      .pipe(map((res) => res.dati));
  }

  /**
   * PUBBLICA DOCUMENTO — POST /documenti-legali/:id/pubblicazione
   */
  pubblicaDocumentoLegale(id: number): Observable<DocumentoLegaleInterface> {
    return this.http
      .post<RispostaApiInterface<DocumentoLegaleInterface>>(
        `${this.apiUrl}/documenti-legali/${id}/pubblicazione`,
        null,
      )
      .pipe(map((res) => res.dati));
  }

  /**
   * ELIMINA DOCUMENTO — DELETE /documenti-legali/:id
   * Solo le bozze.
   */
  eliminaDocumentoLegale(id: number): Observable<null> {
    return this.http
      .delete<RispostaApiInterface<null>>(`${this.apiUrl}/documenti-legali/${id}`)
      .pipe(map((res) => res.dati));
  }

  // ─── Eventi in zona ───

  /**
   * EVENTI — GET /eventi
   */
  elencaEventi(filtri: FiltriEventi = {}): Observable<EventoSpecialeInterface[]> {
    return this.http
      .get<RispostaApiInterface<EventoSpecialeInterface[]>>(`${this.apiUrl}/eventi`, {
        params: creaParametri(filtri),
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * CREA EVENTO — POST /eventi
   */
  creaEvento(dati: EventoSpecialeCreaPayload): Observable<EventoSpecialeInterface> {
    return this.http
      .post<RispostaApiInterface<EventoSpecialeInterface>>(`${this.apiUrl}/eventi`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * DETTAGLIO EVENTO — GET /eventi/:id
   */
  leggiEvento(id: number): Observable<EventoSpecialeInterface> {
    return this.http
      .get<RispostaApiInterface<EventoSpecialeInterface>>(`${this.apiUrl}/eventi/${id}`)
      .pipe(map((res) => res.dati));
  }

  /**
   * AGGIORNA EVENTO — PATCH /eventi/:id
   */
  aggiornaEvento(
    id: number,
    dati: EventoSpecialeAggiornaPayload,
  ): Observable<EventoSpecialeInterface> {
    return this.http
      .patch<RispostaApiInterface<EventoSpecialeInterface>>(`${this.apiUrl}/eventi/${id}`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * ELIMINA EVENTO — DELETE /eventi/:id
   */
  eliminaEvento(id: number): Observable<null> {
    return this.http
      .delete<RispostaApiInterface<null>>(`${this.apiUrl}/eventi/${id}`)
      .pipe(map((res) => res.dati));
  }
}
