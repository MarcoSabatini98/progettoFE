import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { rxResource, takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  EMPTY,
  Observable,
  catchError,
  concat,
  filter,
  finalize,
  map,
  of,
  switchMap,
  tap,
  timer,
} from 'rxjs';

import { AuthService } from '../../../core/services/auth/auth-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import {
  EVENTI_SOCKET,
  MESSAGGI_PER_PAGINA,
  SCRIVE_SCADENZA_MS,
} from '../../../core/services/chat/chat-costanti';
import { ChatService } from '../../../core/services/chat/chat-service';
import { nomeConversazione } from '../../../core/services/chat/nome-conversazione';
import { PresenzeService } from '../../../core/services/chat/presenze-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import { SocketService } from '../../../core/services/socket/socket-service';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { ConversazioneInterface } from '../../../shared/models/conversazione/conversazione-model';
import {
  EventoConversazioneInterface,
  EventoMessaggioEliminatoInterface,
  EventoMessaggioInterface,
  EventoMessaggioModificatoInterface,
  EventoScriveInterface,
} from '../../../shared/models/evento-chat/evento-chat-model';
import { MessaggioInterface } from '../../../shared/models/messaggio/messaggio-model';
import { AzioniConversazioneComponent } from '../azioni-conversazione-component/azioni-conversazione-component';
import { MessaggioChatComponent } from '../../../shared/messaggio-chat-component/messaggio-chat-component';
import { ScriviMessaggioComponent } from '../../../shared/scrivi-messaggio-component/scrivi-messaggio-component';

/**
 * Conversazione aperta nel riquadro della chat: storico a ritroso, messaggi in
 * tempo reale, "sta scrivendo" e comandi. Si segna letta all'apertura e a ogni
 * messaggio altrui.
 */
@Component({
  selector: 'app-conversazione',
  imports: [
    RouterLink,
    TranslocoPipe,
    IconaComponent,
    AzioniConversazioneComponent,
    MessaggioChatComponent,
    ScriviMessaggioComponent,
  ],
  templateUrl: './conversazione-component.html',
  styleUrl: './conversazione-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class ConversazioneComponent {
  private readonly chat = inject(ChatService);
  private readonly socket = inject(SocketService);
  private readonly avvisi = inject(AvvisiService);
  protected readonly errori = inject(ErroriService);
  private readonly auth = inject(AuthService);
  protected readonly presenze = inject(PresenzeService);

  readonly uuid = input.required<string>();

  protected readonly elenco = PERCORSI_STAFF.chat;
  protected readonly mioId = computed(() => this.auth.utente()?.id);
  protected readonly dettaglio = rxResource({
    params: () => this.uuid(),
    stream: ({ params }) => this.chat.leggiConversazione(params),
  });
  protected readonly storico = rxResource({
    params: () => this.uuid(),
    stream: ({ params }) =>
      this.chat.elencaMessaggi(params).pipe(tap(() => this.segnaLetto(params))),
  });
  /** Lo storico più i messaggi arrivati o caricati dopo. */
  protected readonly messaggi = linkedSignal<MessaggioInterface[]>(() =>
    this.storico.hasValue() ? this.storico.value() : [],
  );
  /** Una pagina non piena: non c'è niente di più vecchio. */
  protected readonly finiti = linkedSignal(
    () => (this.storico.value()?.length ?? 0) < MESSAGGI_PER_PAGINA,
  );
  protected readonly caricando = signal(false);
  protected readonly perId = computed(
    () => new Map(this.messaggi().map((messaggio) => [messaggio.id, messaggio])),
  );
  protected readonly rispondiA = linkedSignal<string, MessaggioInterface | null>({
    source: this.uuid,
    computation: () => null,
  });
  protected readonly nome = computed(() =>
    this.dettaglio.hasValue() ? nomeConversazione(this.dettaglio.value(), this.mioId()) : '',
  );
  /** Chi sta scrivendo adesso; sparisce da solo se non arrivano conferme. */
  protected readonly scrive = toSignal(
    toObservable(this.uuid).pipe(
      switchMap((uuid) => this.daQui<EventoScriveInterface>(EVENTI_SOCKET.SCRIVE, uuid)),
      filter((evento) => evento.utente_id !== this.mioId()),
      switchMap((evento) =>
        evento.attivo
          ? concat(of(evento), timer(SCRIVE_SCADENZA_MS).pipe(map(() => null)))
          : of(null),
      ),
      map((evento) => evento && this.autore(evento)),
    ),
  );

  constructor() {
    this.ascolta<EventoMessaggioInterface>(EVENTI_SOCKET.MESSAGGIO).subscribe((evento) => {
      this.messaggi.update((elenco) => [
        ...elenco.filter((m) => m.id !== evento.messaggio.id),
        evento.messaggio,
      ]);
      if (evento.messaggio.mittente_utente_id !== this.mioId()) {
        this.segnaLetto(evento.conversazione);
      }
    });
    this.ascolta<EventoMessaggioModificatoInterface>(EVENTI_SOCKET.MESSAGGIO_MODIFICATO).subscribe(
      (evento) => this.sostituisci(evento.messaggio),
    );
    this.ascolta<EventoMessaggioEliminatoInterface>(EVENTI_SOCKET.MESSAGGIO_ELIMINATO).subscribe(
      (evento) => this.togli(evento.messaggio_id),
    );
    this.ascolta<EventoConversazioneInterface>(EVENTI_SOCKET.CONVERSAZIONE).subscribe((evento) =>
      this.dettaglio.set(evento.dettaglio),
    );
  }

  /**
   * CARICA PRECEDENTI
   * Una pagina più vecchia del primo messaggio in vista, messa in cima.
   */
  caricaPrecedenti(): void {
    const primo = this.messaggi()[0];
    if (!primo) {
      return;
    }
    this.caricando.set(true);
    this.chat
      .elencaMessaggi(this.uuid(), { prima_di: primo.id })
      .pipe(finalize(() => this.caricando.set(false)))
      .subscribe({
        next: (vecchi) => {
          this.finiti.set(vecchi.length < MESSAGGI_PER_PAGINA);
          this.messaggi.update((elenco) => [...vecchi, ...elenco]);
        },
        error: (motivo: unknown) => this.avvisi.mostra(this.errori.messaggio(motivo), 'errore'),
      });
  }

  /**
   * ARRIVATO
   * Il proprio messaggio entra subito, senza aspettare il socket.
   */
  arrivato(messaggio: MessaggioInterface): void {
    this.messaggi.update((elenco) => [...elenco.filter((m) => m.id !== messaggio.id), messaggio]);
  }

  sostituisci(messaggio: MessaggioInterface): void {
    this.messaggi.update((elenco) => elenco.map((m) => (m.id === messaggio.id ? messaggio : m)));
  }

  togli(id: number): void {
    this.messaggi.update((elenco) => elenco.filter((m) => m.id !== id));
  }

  aggiorna(dettaglio: ConversazioneInterface): void {
    this.dettaglio.set(dettaglio);
  }

  /** Eventi del socket solo di questa conversazione, anche se l'uuid cambia. */
  private ascolta<T extends { conversazione: string }>(evento: string): Observable<T> {
    return toObservable(this.uuid).pipe(
      switchMap((uuid) => this.daQui<T>(evento, uuid)),
      takeUntilDestroyed(),
    );
  }

  private daQui<T extends { conversazione: string }>(evento: string, uuid: string): Observable<T> {
    return this.socket.ascolta<T>(evento).pipe(filter((dati) => dati.conversazione === uuid));
  }

  /** Nome di chi scrive: un collega o il cliente/visitatore dell'assistenza. */
  private autore(evento: EventoScriveInterface): string {
    const dettaglio = this.dettaglio.value();
    const utente = [...(dettaglio?.partecipanti ?? []), dettaglio?.cliente].find(
      (persona) => persona && persona.id === evento.utente_id,
    );
    return utente ? `${utente.nome} ${utente.cognome}` : (dettaglio?.visitatore?.nome ?? '');
  }

  /** Non vitale: se fallisce resta solo il contatore dei non letti. */
  private segnaLetto(uuid: string): void {
    this.chat
      .segnaLetto(uuid)
      .pipe(catchError(() => EMPTY))
      .subscribe();
  }
}
