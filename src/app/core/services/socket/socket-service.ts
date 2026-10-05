import { Injectable, InjectionToken, effect, inject } from '@angular/core';
import { EMPTY, Observable, catchError, of } from 'rxjs';
import { Socket, io } from 'socket.io-client';

import { environment } from '../../../../environments/environment';
import { ErroreApiInterface } from '../../../shared/models/errore-api/errore-api-model';
import { EsitoSocketInterface } from '../../../shared/models/esito-socket/esito-socket-model';
import { TOKEN_CHAT_NON_VALIDO } from '../auth/auth-costanti';
import { AuthService } from '../auth/auth-service';

/** Oltre questa attesa la conferma del server si considera persa. */
const ATTESA_CONFERMA_MS = 5000;

/** Rifiuto all'apertura per token scaduto: si rinnova e si riprova. */
const TOKEN_SCADUTO = 'TOKEN_SCADUTO';

/** Apre la connessione: socket.io di default, un finto nei test. */
export const APRI_SOCKET = new InjectionToken<typeof io>('APRI_SOCKET', {
  providedIn: 'root',
  factory: () => io,
});

/**
 * Tempo reale con il backend (chat, presenza, notifiche). Una sola connessione,
 * aperta al primo ascolto con il token dell'utente o del visitatore.
 */
@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private readonly auth = inject(AuthService);
  private readonly io = inject(APRI_SOCKET);
  private socket: Socket | null = null;

  constructor() {
    // Uscita dall'account: il socket non resta aperto con il token vecchio.
    effect(() => {
      if (!this.auth.token()) {
        this.socket?.disconnect();
      }
    });
  }

  /**
   * ASCOLTA
   * Eventi del server finché c'è chi li ascolta.
   */
  ascolta<T>(evento: string): Observable<T> {
    return new Observable<T>((osservatore) => {
      const socket = this.collega();
      const consegna = (dati: T) => osservatore.next(dati);
      socket.on(evento, consegna);
      return () => socket.off(evento, consegna);
    });
  }

  /**
   * EMETTI
   * Evento con la conferma del server; senza risposta in tempo, errore.
   */
  emetti(evento: string, dati: object): Observable<EsitoSocketInterface> {
    return new Observable<EsitoSocketInterface>((osservatore) => {
      this.collega()
        .timeout(ATTESA_CONFERMA_MS)
        .emit(evento, dati, (errore: Error | null, esito: EsitoSocketInterface) => {
          if (errore) {
            osservatore.error(errore);
            return;
          }
          osservatore.next(esito);
          osservatore.complete();
        });
    });
  }

  private collega(): Socket {
    this.socket ??= this.apri();
    if (!this.socket.active) {
      this.socket.connect();
    }
    return this.socket;
  }

  private apri(): Socket {
    // Il socket sta sullo stesso server che serve /media.
    const socket = this.io(environment.mediaUrl, {
      auth: (consegna) => consegna({ token: this.auth.token() }),
      withCredentials: true,
    });
    // Alla scadenza del token il server chiude: si rinnova e ci si ricollega.
    socket.on('disconnect', (motivo) => {
      if (motivo === 'io server disconnect') {
        this.ricollega(socket);
      }
    });
    socket.on('connect_error', (errore: Error & { data?: ErroreApiInterface }) => {
      if (errore.data?.codice === TOKEN_SCADUTO) {
        this.ricollega(socket);
      } else if (errore.data?.codice === TOKEN_CHAT_NON_VALIDO) {
        // Visitatore sconosciuto al server: col prossimo token si riapre.
        this.auth.dimenticaTokenChat();
      }
    });
    return socket;
  }

  /** Il visitatore ha un token lungo: si ricollega e basta. */
  private ricollega(socket: Socket): void {
    const pronto: Observable<unknown> = this.auth.collegato() ? this.auth.rinnova() : of(null);
    // Rinnovo fallito: la sessione si chiude e l'effetto scollega il socket.
    pronto.pipe(catchError(() => EMPTY)).subscribe(() => socket.connect());
  }
}
