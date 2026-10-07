import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, shareReplay, tap, throwError } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { CodicePermesso } from '../../../shared/models/permesso/permesso-model';
import { RispostaApiInterface } from '../../../shared/models/risposta-api/risposta-api-model';
import { RequisitiAccessoInterface } from '../../../shared/models/requisiti-accesso/requisiti-accesso-model';
import { CodiceRuolo } from '../../../shared/models/ruolo/ruolo-model';
import {
  CambioPasswordPayload,
  CredenzialiPayload,
  NuovaPasswordPayload,
  RegistrazionePayload,
  SessioneInterface,
  UtenteSessioneInterface,
} from '../../../shared/models/sessione/sessione-model';
import { CHIAVI_ARCHIVIO } from '../archivio/archivio-costanti';
import { ArchivioService } from '../archivio/archivio-service';

/**
 * Sessione dell'utente. L'access token vive solo in memoria (mai nello storage);
 * il refresh token sta nel cookie httpOnly e al riavvio ripristina la sessione.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly archivio = inject(ArchivioService);
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly sessione = signal<SessioneInterface | null>(null);
  private readonly tokenChat = signal(this.archivio.leggiTesto(CHIAVI_ARCHIVIO.tokenChat));
  private rinnovoInCorso: Observable<UtenteSessioneInterface> | null = null;

  readonly utente = computed(() => this.sessione()?.utente ?? null);
  readonly collegato = computed(() => this.sessione() !== null);
  /** Token dell'header Authorization: quello dell'utente o, senza account, quello della chat. */
  readonly token = computed(() => this.sessione()?.accessToken ?? this.tokenChat());

  /**
   * HA RUOLO
   * true se l'utente ha almeno uno dei ruoli.
   */
  haRuolo(ruoli: readonly CodiceRuolo[]): boolean {
    const ruolo = this.utente()?.ruolo;
    return ruolo !== undefined && ruoli.includes(ruolo);
  }

  /**
   * HA PERMESSI
   * true se l'utente li ha tutti.
   */
  haPermessi(permessi: readonly CodicePermesso[]): boolean {
    const posseduti = this.utente()?.permessi ?? [];
    return permessi.every((permesso) => posseduti.includes(permesso));
  }

  /**
   * PUÒ ACCEDERE
   * Stessa regola per le rotte (ruoloGuard) e per le voci di menu.
   */
  puoAccedere({ ruoli, permessi }: RequisitiAccessoInterface): boolean {
    return (!ruoli || this.haRuolo(ruoli)) && (!permessi || this.haPermessi(permessi));
  }

  /**
   * REGISTRA — POST /registrazione
   */
  registra(dati: RegistrazionePayload): Observable<UtenteSessioneInterface> {
    return this.apri(`${this.apiUrl}/registrazione`, dati);
  }

  /**
   * ACCEDI — POST /accesso
   */
  accedi(credenziali: CredenzialiPayload): Observable<UtenteSessioneInterface> {
    return this.apri(`${this.apiUrl}/accesso`, credenziali);
  }

  /**
   * RINNOVA — POST /rinnovo
   * Le richieste che trovano il token scaduto nello stesso momento condividono un solo rinnovo.
   */
  rinnova(): Observable<UtenteSessioneInterface> {
    this.rinnovoInCorso ??= this.apri(`${this.apiUrl}/rinnovo`, null).pipe(
      catchError((errore: unknown) => {
        this.pulisci();
        return throwError(() => errore);
      }),
      finalize(() => {
        this.rinnovoInCorso = null;
      }),
      shareReplay(1),
    );
    return this.rinnovoInCorso;
  }

  /**
   * RIPRISTINA
   * All'avvio: riprende la sessione se nel cookie c'è un refresh token. Non fallisce mai.
   */
  ripristina(): Observable<UtenteSessioneInterface | null> {
    if (this.archivio.leggiTesto(CHIAVI_ARCHIVIO.sessione) === null) {
      return of(null);
    }
    return this.rinnova().pipe(catchError(() => of(null)));
  }

  /**
   * ESCI — POST /uscita
   * La sessione locale si chiude anche se la chiamata fallisce.
   */
  esci(): Observable<null> {
    return this.chiudi(this.http.post<RispostaApiInterface<null>>(`${this.apiUrl}/uscita`, null));
  }

  /**
   * ESCI OVUNQUE — POST /uscita-ovunque
   */
  esciOvunque(): Observable<null> {
    return this.chiudi(
      this.http.post<RispostaApiInterface<null>>(`${this.apiUrl}/uscita-ovunque`, null),
    );
  }

  /**
   * RICHIEDI CODICE VERIFICA — POST /verifica-email/codice
   */
  richiediCodiceVerifica(): Observable<null> {
    return this.http
      .post<RispostaApiInterface<null>>(`${this.apiUrl}/verifica-email/codice`, null)
      .pipe(map((res) => res.dati));
  }

  /**
   * VERIFICA EMAIL — POST /verifica-email
   */
  verificaEmail(codice: string): Observable<null> {
    return this.http
      .post<RispostaApiInterface<null>>(`${this.apiUrl}/verifica-email`, { codice })
      .pipe(
        map((res) => res.dati),
        tap(() => this.aggiornaUtente({ email_verificata: true })),
      );
  }

  /**
   * RICHIEDI RESET PASSWORD — POST /password/reset
   */
  richiediResetPassword(email: string): Observable<null> {
    return this.http
      .post<RispostaApiInterface<null>>(`${this.apiUrl}/password/reset`, { email })
      .pipe(map((res) => res.dati));
  }

  /**
   * NUOVA PASSWORD — POST /password/nuova
   */
  impostaNuovaPassword(dati: NuovaPasswordPayload): Observable<null> {
    return this.http
      .post<RispostaApiInterface<null>>(`${this.apiUrl}/password/nuova`, dati)
      .pipe(map((res) => res.dati));
  }

  /**
   * DISISCRIZIONE — POST /disiscrizione
   * Dal link nelle email delle offerte: funziona anche senza accesso.
   */
  disiscrivi(token: string): Observable<null> {
    return this.http
      .post<RispostaApiInterface<null>>(`${this.apiUrl}/disiscrizione`, { token })
      .pipe(map((res) => res.dati));
  }

  /**
   * CAMBIA PASSWORD — PUT /password
   * Il backend chiude tutte le sessioni: si rientra con la nuova password.
   */
  cambiaPassword(dati: CambioPasswordPayload): Observable<null> {
    return this.http.put<RispostaApiInterface<null>>(`${this.apiUrl}/password`, dati).pipe(
      map((res) => res.dati),
      tap(() => this.pulisci()),
    );
  }

  /**
   * ELIMINA ACCOUNT — DELETE /account
   */
  eliminaAccount(password: string): Observable<null> {
    return this.http
      .delete<RispostaApiInterface<null>>(`${this.apiUrl}/account`, { body: { password } })
      .pipe(
        map((res) => res.dati),
        tap(() => this.pulisci()),
      );
  }

  /**
   * AGGIORNA UTENTE
   * Riporta nella sessione i dati cambiati dal profilo (es. nome, lingua).
   */
  aggiornaUtente(modifiche: Partial<UtenteSessioneInterface>): void {
    this.sessione.update((sessione) =>
      sessione ? { ...sessione, utente: { ...sessione.utente, ...modifiche } } : null,
    );
  }

  /**
   * IMPOSTA TOKEN CHAT
   * Token del visitatore senza account, conservato sul dispositivo.
   */
  impostaTokenChat(token: string): void {
    this.tokenChat.set(token);
    this.archivio.scrivi(CHIAVI_ARCHIVIO.tokenChat, token);
  }

  /**
   * DIMENTICA TOKEN CHAT
   * Il server non riconosce più il visitatore: al prossimo messaggio ne nasce uno nuovo.
   */
  dimenticaTokenChat(): void {
    this.tokenChat.set(null);
    this.archivio.elimina(CHIAVI_ARCHIVIO.tokenChat);
  }

  private apri(url: string, corpo: unknown): Observable<UtenteSessioneInterface> {
    return this.http.post<RispostaApiInterface<SessioneInterface>>(url, corpo).pipe(
      map((res) => {
        this.sessione.set(res.dati);
        this.archivio.scrivi(CHIAVI_ARCHIVIO.sessione, '1');
        return res.dati.utente;
      }),
    );
  }

  private chiudi(richiesta: Observable<RispostaApiInterface<null>>): Observable<null> {
    return richiesta.pipe(
      map((res) => res.dati),
      finalize(() => this.pulisci()),
    );
  }

  private pulisci(): void {
    this.sessione.set(null);
    this.archivio.elimina(CHIAVI_ARCHIVIO.sessione);
  }
}
