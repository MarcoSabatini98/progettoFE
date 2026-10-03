import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

import { StatoPresenza } from '../../../shared/models/conversazione/conversazione-model';
import { EsitoSocketInterface } from '../../../shared/models/esito-socket/esito-socket-model';
import { PresenzaInterface } from '../../../shared/models/evento-chat/evento-chat-model';
import { AuthService } from '../auth/auth-service';
import { SocketService } from '../socket/socket-service';
import { EVENTI_SOCKET } from './chat-costanti';

/**
 * Presenza dello staff in tempo reale. Basta iniettarlo perché il socket si apra
 * e l'utente risulti online: lo fa il guscio del gestionale.
 */
@Injectable({
  providedIn: 'root',
})
export class PresenzeService {
  private readonly socket = inject(SocketService);
  private readonly auth = inject(AuthService);
  /** Solo chi non è offline. */
  private readonly stati = signal(new Map<number, StatoPresenza>());

  readonly mia = computed(() => this.di(this.auth.utente()?.id));

  constructor() {
    // Al collegamento arriva l'elenco intero, poi i singoli cambi.
    this.socket
      .ascolta<PresenzaInterface[]>(EVENTI_SOCKET.PRESENZE)
      .pipe(takeUntilDestroyed())
      .subscribe((elenco) => this.stati.set(new Map(elenco.map((p) => [p.utente_id, p.stato]))));
    this.socket
      .ascolta<PresenzaInterface>(EVENTI_SOCKET.PRESENZA)
      .pipe(takeUntilDestroyed())
      .subscribe((p) => this.stati.update((stati) => new Map(stati).set(p.utente_id, p.stato)));
  }

  /**
   * DI
   * Stato di un membro dello staff; chi non risulta è offline.
   */
  di(utenteId: number | undefined): StatoPresenza {
    return (utenteId !== undefined && this.stati().get(utenteId)) || 'offline';
  }

  /**
   * IMPOSTA
   * Il proprio stato, visto da tutto lo staff.
   */
  imposta(stato: StatoPresenza): Observable<EsitoSocketInterface> {
    return this.socket.emetti(EVENTI_SOCKET.PRESENZA, { stato });
  }
}
