import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ClientiPerLivelloInterface } from '../../../shared/models/clienti-per-livello/clienti-per-livello-model';
import {
  FiltriClassificaFedelta,
  SituazioneFedeltaInterface,
} from '../../../shared/models/fedelta-utente/fedelta-utente-model';
import {
  LivelloFedeltaAggiornaPayload,
  LivelloFedeltaCreaPayload,
  LivelloFedeltaInterface,
} from '../../../shared/models/livello-fedelta/livello-fedelta-model';
import {
  MovimentoPuntiInterface,
  PuntiPayload,
} from '../../../shared/models/movimento-punti/movimento-punti-model';
import {
  PaginaInterface,
  ParametriPaginaInterface,
} from '../../../shared/models/pagina/pagina-model';
import { RispostaApiInterface } from '../../../shared/models/risposta-api/risposta-api-model';
import { StatisticheFedeltaInterface } from '../../../shared/models/statistiche-fedelta/statistiche-fedelta-model';
import { UtenteInterface } from '../../../shared/models/utente/utente-model';
import { creaParametri } from '../api/parametri-http';

/**
 * Programma fedeltà: livelli, punti e sconti.
 * Senza utenteId situazione e movimenti sono quelli del cliente collegato (/mia).
 */
@Injectable({
  providedIn: 'root',
})
export class FedeltaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/fedelta`;

  // ─── Livelli ───

  /**
   * LIVELLI — GET /livelli
   */
  elencaLivelli(): Observable<LivelloFedeltaInterface[]> {
    return this.http
      .get<RispostaApiInterface<LivelloFedeltaInterface[]>>(`${this.apiUrl}/livelli`)
      .pipe(map((res) => res.dati));
  }

  /**
   * CREA LIVELLO — POST /livelli
   */
  creaLivello(dati: LivelloFedeltaCreaPayload): Observable<LivelloFedeltaInterface> {
    return this.http
      .post<RispostaApiInterface<LivelloFedeltaInterface>>(`${this.apiUrl}/livelli`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * DETTAGLIO LIVELLO — GET /livelli/:id
   */
  leggiLivello(id: number): Observable<LivelloFedeltaInterface> {
    return this.http
      .get<RispostaApiInterface<LivelloFedeltaInterface>>(`${this.apiUrl}/livelli/${id}`)
      .pipe(map((res) => res.dati));
  }

  /**
   * AGGIORNA LIVELLO — PATCH /livelli/:id
   */
  aggiornaLivello(
    id: number,
    dati: LivelloFedeltaAggiornaPayload,
  ): Observable<LivelloFedeltaInterface> {
    return this.http
      .patch<RispostaApiInterface<LivelloFedeltaInterface>>(`${this.apiUrl}/livelli/${id}`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * ELIMINA LIVELLO — DELETE /livelli/:id
   * Il livello di partenza non si elimina.
   */
  eliminaLivello(id: number): Observable<null> {
    return this.http
      .delete<RispostaApiInterface<null>>(`${this.apiUrl}/livelli/${id}`)
      .pipe(map((res) => res.dati));
  }

  // ─── Cliente e gestione ───

  /**
   * SITUAZIONE — GET /mia | /clienti/:utenteId
   * null = cliente senza punti.
   */
  leggiSituazione(utenteId?: number): Observable<SituazioneFedeltaInterface | null> {
    return this.http
      .get<RispostaApiInterface<SituazioneFedeltaInterface | null>>(this.url(utenteId))
      .pipe(map((res) => res.dati));
  }

  /**
   * MOVIMENTI — GET /mia/movimenti | /clienti/:utenteId/movimenti
   */
  elencaMovimenti(
    parametri: ParametriPaginaInterface = {},
    utenteId?: number,
  ): Observable<PaginaInterface<MovimentoPuntiInterface>> {
    return this.http
      .get<RispostaApiInterface<PaginaInterface<MovimentoPuntiInterface>>>(
        `${this.url(utenteId)}/movimenti`,
        { params: creaParametri(parametri) },
      )
      .pipe(map((res) => res.dati));
  }

  /**
   * MIE STATISTICHE — GET /mia/statistiche
   * Senza anno vale quello in corso.
   */
  leggiMieStatistiche(anno?: number): Observable<StatisticheFedeltaInterface> {
    return this.http
      .get<RispostaApiInterface<StatisticheFedeltaInterface>>(`${this.apiUrl}/mia/statistiche`, {
        params: creaParametri({ anno }),
      })
      .pipe(map((res) => res.dati));
  }

  // ─── Gestione ───

  /**
   * CLASSIFICA — GET /clienti
   */
  elencaClassifica(
    filtri: FiltriClassificaFedelta = {},
  ): Observable<PaginaInterface<UtenteInterface>> {
    return this.http
      .get<RispostaApiInterface<PaginaInterface<UtenteInterface>>>(`${this.apiUrl}/clienti`, {
        params: creaParametri(filtri),
      })
      .pipe(map((res) => res.dati));
  }

  /**
   * PER LIVELLO — GET /clienti/per-livello
   */
  contaClientiPerLivello(): Observable<ClientiPerLivelloInterface[]> {
    return this.http
      .get<RispostaApiInterface<ClientiPerLivelloInterface[]>>(`${this.apiUrl}/clienti/per-livello`)
      .pipe(map((res) => res.dati));
  }

  /**
   * ASSEGNA PUNTI — POST /clienti/:utenteId/punti
   */
  assegnaPunti(utenteId: number, dati: PuntiPayload): Observable<SituazioneFedeltaInterface> {
    return this.http
      .post<RispostaApiInterface<SituazioneFedeltaInterface>>(`${this.url(utenteId)}/punti`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * IMPOSTA LIVELLO — PUT /clienti/:utenteId/livello
   * Aggiunge o toglie i punti che servono per il livello indicato.
   */
  impostaLivello(utenteId: number, livello: string): Observable<SituazioneFedeltaInterface> {
    return this.http
      .put<RispostaApiInterface<SituazioneFedeltaInterface>>(`${this.url(utenteId)}/livello`, {
        livello,
      })
      .pipe(map((res) => res.dati));
  }

  private url(utenteId?: number): string {
    return utenteId === undefined ? `${this.apiUrl}/mia` : `${this.apiUrl}/clienti/${utenteId}`;
  }
}
