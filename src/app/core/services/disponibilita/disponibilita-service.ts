import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  BloccaCameraPayload,
  BloccoCameraInterface,
} from '../../../shared/models/blocco-camera/blocco-camera-model';
import {
  DisponibilitaInterface,
  FiltriDisponibilita,
} from '../../../shared/models/disponibilita/disponibilita-model';
import {
  FiltriOccupazione,
  OccupazioneCameraInterface,
} from '../../../shared/models/occupazione-camera/occupazione-camera-model';
import { RispostaApiInterface } from '../../../shared/models/risposta-api/risposta-api-model';
import { creaParametri } from '../api/parametri-http';

/** Ricerca delle camere libere dal sito e blocco della camera durante la prenotazione. */
@Injectable({
  providedIn: 'root',
})
export class DisponibilitaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/disponibilita`;

  /**
   * CERCA — GET /
   * Le età dei bambini partono ripetute (eta_bambini=3&eta_bambini=5), non unite da virgole.
   */
  cerca(filtri: FiltriDisponibilita): Observable<DisponibilitaInterface[]> {
    const { eta_bambini = [], ...resto } = filtri;
    const params = eta_bambini.reduce(
      (parametri, eta) => parametri.append('eta_bambini', eta),
      creaParametri(resto),
    );
    return this.http
      .get<RispostaApiInterface<DisponibilitaInterface[]>>(this.apiUrl, { params })
      .pipe(map((res) => res.dati));
  }

  /**
   * LEGGI OCCUPAZIONE — GET /occupazione
   * Notti occupate di una camera o di una tipologia in [dal, al), per il calendario.
   */
  leggiOccupazione(filtri: FiltriOccupazione, dal: string, al: string): Observable<string[]> {
    return this.http
      .get<RispostaApiInterface<OccupazioneCameraInterface>>(`${this.apiUrl}/occupazione`, {
        params: creaParametri({ ...filtri, dal, al }),
      })
      .pipe(map((res) => res.dati.occupate));
  }

  /**
   * BLOCCA — POST /blocchi
   * Sostituisce il blocco precedente della stessa sessione.
   */
  blocca(dati: BloccaCameraPayload): Observable<BloccoCameraInterface> {
    return this.http
      .post<RispostaApiInterface<BloccoCameraInterface>>(`${this.apiUrl}/blocchi`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * RILASCIA — DELETE /blocchi/:sessione
   */
  rilascia(sessione: string): Observable<null> {
    return this.http
      .delete<RispostaApiInterface<null>>(`${this.apiUrl}/blocchi/${sessione}`)
      .pipe(map((res) => res.dati));
  }
}
