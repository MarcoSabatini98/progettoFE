import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { rxResource, takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { EMPTY, Observable, catchError, filter, finalize, map, of, switchMap, tap } from 'rxjs';

import { AuthService } from '../../core/services/auth/auth-service';
import {
  EVENTI_SOCKET,
  NOME_VISITATORE_MAX,
  TESTO_MAX,
} from '../../core/services/chat/chat-costanti';
import { ChatService } from '../../core/services/chat/chat-service';
import { ErroriService } from '../../core/services/errori/errori-service';
import { LinguaService } from '../../core/services/lingua/lingua-service';
import { SocketService } from '../../core/services/socket/socket-service';
import { CampoComponent } from '../../shared/campo-component/campo-component';
import { IconaComponent } from '../../shared/icona-component/icona-component';
import { MessaggioChatComponent } from '../../shared/messaggio-chat-component/messaggio-chat-component';
import {
  EventoConversazioneInterface,
  EventoMessaggioEliminatoInterface,
  EventoMessaggioInterface,
  EventoMessaggioModificatoInterface,
} from '../../shared/models/evento-chat/evento-chat-model';
import { MessaggioInterface } from '../../shared/models/messaggio/messaggio-model';
import { ScriviMessaggioComponent } from '../../shared/scrivi-messaggio-component/scrivi-messaggio-component';

/**
 * Chat di assistenza del sito: pulsante in basso a destra e riquadro sopra.
 * Il visitatore senza account lascia, se vuole, nome ed email; il cliente
 * collegato scrive e basta. Riprende la conversazione ancora aperta e segnala
 * le risposte arrivate a riquadro chiuso.
 */
@Component({
  selector: 'app-widget-chat',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    CampoComponent,
    IconaComponent,
    MessaggioChatComponent,
    ScriviMessaggioComponent,
  ],
  templateUrl: './widget-chat-component.html',
  styleUrl: './widget-chat-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetChatComponent {
  private readonly chat = inject(ChatService);
  private readonly socket = inject(SocketService);
  private readonly lingua = inject(LinguaService);
  protected readonly auth = inject(AuthService);
  protected readonly errori = inject(ErroriService);

  protected readonly testoMax = TESTO_MAX;
  protected readonly nomeMax = NOME_VISITATORE_MAX;
  protected readonly aperto = signal(false);
  /** Dal primo clic lo stato resta caricato anche a riquadro chiuso. */
  private readonly avviato = signal(false);
  protected readonly nuovi = signal(false);
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');

  protected readonly disponibile = rxResource({
    params: () => this.avviato() || undefined,
    stream: () => this.chat.assistenzaDisponibile(),
  });
  /** La conversazione da riprendere; si ricarica a ogni accesso o uscita. */
  protected readonly aperta = rxResource({
    params: () => (this.avviato() ? String(this.auth.utente()?.id ?? '') : undefined),
    stream: () =>
      this.auth.token()
        ? this.chat
            .elencaConversazioni({ stato: 'aperta' })
            .pipe(map((pagina) => pagina.elementi[0] ?? null))
        : of(null),
  });
  protected readonly conversazione = linkedSignal(() => this.aperta.value() ?? null);
  private readonly uuid = computed(() => this.conversazione()?.uuid);
  private readonly storico = rxResource({
    params: () => this.uuid(),
    stream: ({ params }) => this.chat.elencaMessaggi(params).pipe(tap(() => this.segnaLetto())),
  });
  protected readonly messaggi = linkedSignal<MessaggioInterface[]>(() =>
    this.storico.hasValue() ? this.storico.value() : [],
  );
  protected readonly perId = computed(
    () => new Map(this.messaggi().map((messaggio) => [messaggio.id, messaggio])),
  );
  protected readonly rispondiA = signal<MessaggioInterface | null>(null);

  protected readonly modulo = inject(NonNullableFormBuilder).group({
    nome: ['', Validators.maxLength(NOME_VISITATORE_MAX)],
    email: ['', Validators.email],
    testo: ['', [Validators.required, Validators.maxLength(TESTO_MAX)]],
  });

  constructor() {
    this.ascolta<EventoMessaggioInterface>(EVENTI_SOCKET.MESSAGGIO).subscribe((evento) => {
      this.conversazione.set(evento.dettaglio);
      this.arrivato(evento.messaggio);
      if (!this.mio(evento.messaggio)) {
        this.daLeggere();
      }
    });
    this.ascolta<EventoMessaggioModificatoInterface>(EVENTI_SOCKET.MESSAGGIO_MODIFICATO)
      .pipe(filter((evento) => evento.conversazione === this.uuid()))
      .subscribe((evento) => this.sostituisci(evento.messaggio));
    this.ascolta<EventoMessaggioEliminatoInterface>(EVENTI_SOCKET.MESSAGGIO_ELIMINATO)
      .pipe(filter((evento) => evento.conversazione === this.uuid()))
      .subscribe((evento) => this.togli(evento.messaggio_id));
    this.ascolta<EventoConversazioneInterface>(EVENTI_SOCKET.CONVERSAZIONE)
      .pipe(filter((evento) => evento.conversazione === this.uuid()))
      .subscribe((evento) => this.conversazione.set(evento.dettaglio));
  }

  alterna(): void {
    this.aperto.update((aperto) => !aperto);
    this.avviato.set(true);
    if (this.aperto()) {
      this.nuovi.set(false);
      this.segnaLetto();
    }
  }

  /**
   * AVVIA
   * Chi non ha un token diventa visitatore, poi si apre l'assistenza col primo messaggio.
   */
  avvia(): void {
    if (this.modulo.invalid) {
      this.modulo.markAllAsTouched();
      return;
    }
    const { nome, email, testo } = this.modulo.getRawValue();
    const accesso: Observable<unknown> = this.auth.token()
      ? of(null)
      : this.chat.creaVisitatore({ nome, email, lingua: this.lingua.attiva() });
    this.inCorso.set(true);
    this.errore.set('');
    accesso
      .pipe(
        switchMap(() => this.chat.apriAssistenza({ testo })),
        finalize(() => this.inCorso.set(false)),
      )
      .subscribe({
        next: (conversazione) => {
          this.modulo.controls.testo.reset();
          this.conversazione.set(conversazione);
        },
        error: (motivo: unknown) => this.errore.set(this.errori.messaggio(motivo)),
      });
  }

  /** Il cliente risponde col suo account, il visitatore col token del sito. */
  protected mio(messaggio: MessaggioInterface): boolean {
    const utenteId = this.auth.utente()?.id;
    return utenteId
      ? messaggio.mittente_utente_id === utenteId
      : messaggio.mittente_visitatore_id !== null;
  }

  arrivato(messaggio: MessaggioInterface): void {
    this.messaggi.update((elenco) => [...elenco.filter((m) => m.id !== messaggio.id), messaggio]);
  }

  sostituisci(messaggio: MessaggioInterface): void {
    this.messaggi.update((elenco) => elenco.map((m) => (m.id === messaggio.id ? messaggio : m)));
  }

  togli(id: number): void {
    this.messaggi.update((elenco) => elenco.filter((m) => m.id !== id));
  }

  /** Solo chi ha un token riceve eventi: il visitatore anonimo non apre il socket. */
  private ascolta<T>(evento: string): Observable<T> {
    return toObservable(this.auth.token).pipe(
      switchMap((token) => (token ? this.socket.ascolta<T>(evento) : EMPTY)),
      takeUntilDestroyed(),
    );
  }

  /** Risposta dello staff: letta se il riquadro è aperto, altrimenti il pallino. */
  private daLeggere(): void {
    if (this.aperto()) {
      this.segnaLetto();
    } else {
      this.nuovi.set(true);
    }
  }

  /** Non vitale: se fallisce resta solo il contatore dei non letti dello staff. */
  private segnaLetto(): void {
    const uuid = this.uuid();
    if (!uuid || !this.aperto()) {
      return;
    }
    this.chat
      .segnaLetto(uuid)
      .pipe(catchError(() => EMPTY))
      .subscribe();
  }
}
