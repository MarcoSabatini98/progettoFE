import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { MatricePermessiInterface } from '../../../shared/models/matrice-permessi/matrice-permessi-model';
import { CodicePermesso } from '../../../shared/models/permesso/permesso-model';
import {
  CoppiaRuoli,
  RegolaChatInterface,
} from '../../../shared/models/regola-chat/regola-chat-model';
import { RispostaApiInterface } from '../../../shared/models/risposta-api/risposta-api-model';
import { RuoloAssegnabile } from '../../../shared/models/ruolo/ruolo-model';

/** Permessi dei ruoli e regole della chat interna: solo per l'admin. */
@Injectable({
  providedIn: 'root',
})
export class PermessiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/permessi`;

  /**
   * MATRICE — GET /
   */
  leggiMatrice(): Observable<MatricePermessiInterface> {
    return this.http
      .get<RispostaApiInterface<MatricePermessiInterface>>(this.apiUrl)
      .pipe(map((res) => res.dati));
  }

  /**
   * IMPOSTA PERMESSI — PUT /:ruolo
   * Sostituisce tutti i permessi del ruolo e restituisce quelli salvati.
   */
  impostaPermessi(
    ruolo: RuoloAssegnabile,
    permessi: CodicePermesso[],
  ): Observable<CodicePermesso[]> {
    return this.http
      .put<RispostaApiInterface<CodicePermesso[]>>(`${this.apiUrl}/${ruolo}`, { permessi })
      .pipe(map((res) => res.dati));
  }

  /**
   * REGOLE CHAT — GET /chat
   */
  leggiRegoleChat(): Observable<RegolaChatInterface[]> {
    return this.http
      .get<RispostaApiInterface<RegolaChatInterface[]>>(`${this.apiUrl}/chat`)
      .pipe(map((res) => res.dati));
  }

  /**
   * IMPOSTA REGOLE CHAT — PUT /chat
   * Sostituisce tutte le regole.
   */
  impostaRegoleChat(coppie: CoppiaRuoli[]): Observable<RegolaChatInterface[]> {
    return this.http
      .put<RispostaApiInterface<RegolaChatInterface[]>>(`${this.apiUrl}/chat`, { coppie })
      .pipe(map((res) => res.dati));
  }
}
