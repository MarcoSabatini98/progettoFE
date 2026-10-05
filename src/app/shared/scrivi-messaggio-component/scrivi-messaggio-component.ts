import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { filter, finalize, throttleTime } from 'rxjs';

import {
  ALLEGATI_MAX,
  EVENTI_SOCKET,
  SCRIVE_OGNI_MS,
  TESTO_MAX,
} from '../../core/services/chat/chat-costanti';
import { ChatService } from '../../core/services/chat/chat-service';
import { ErroriService } from '../../core/services/errori/errori-service';
import { SocketService } from '../../core/services/socket/socket-service';
import { IconaComponent } from '../icona-component/icona-component';
import { MessaggioInterface } from '../models/messaggio/messaggio-model';

/**
 * Casella per scrivere: Invio manda, Maiusc+Invio va a capo. Fino a ALLEGATI_MAX file,
 * la risposta a un messaggio e l'avviso "sta scrivendo" agli altri.
 */
@Component({
  selector: 'app-scrivi-messaggio',
  imports: [ReactiveFormsModule, TranslocoPipe, IconaComponent],
  templateUrl: './scrivi-messaggio-component.html',
  styleUrl: './scrivi-messaggio-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScriviMessaggioComponent {
  private readonly chat = inject(ChatService);
  private readonly socket = inject(SocketService);
  private readonly transloco = inject(TranslocoService);
  private readonly errori = inject(ErroriService);

  readonly uuid = input.required<string>();
  readonly rispondiA = input<MessaggioInterface | null>(null);
  readonly inviato = output<MessaggioInterface>();
  readonly annullaRisposta = output();

  protected readonly testoMax = TESTO_MAX;
  protected readonly allegati = signal<File[]>([]);
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');
  protected readonly testo = inject(NonNullableFormBuilder).control(
    '',
    Validators.maxLength(TESTO_MAX),
  );
  /** Il gruppo rende il form di Angular: ngSubmit senza ricaricare la pagina. */
  protected readonly modulo = new FormGroup({ testo: this.testo });

  constructor() {
    this.testo.valueChanges
      .pipe(
        filter((valore) => Boolean(valore.trim())),
        throttleTime(SCRIVE_OGNI_MS),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.segnala(true));
  }

  /**
   * TASTO
   * Invio manda, Maiusc+Invio va a capo.
   */
  tasto(evento: KeyboardEvent): void {
    if (evento.key === 'Enter' && !evento.shiftKey) {
      evento.preventDefault();
      this.invia();
    }
  }

  /**
   * ALLEGA
   * Oltre il massimo non aggiunge nulla e lo dice.
   */
  allega(campo: HTMLInputElement): void {
    const scelti = Array.from(campo.files ?? []);
    campo.value = '';
    if (this.allegati().length + scelti.length > ALLEGATI_MAX) {
      this.errore.set(
        this.transloco.translate('gestionale.chat.scrivi.troppiAllegati', { max: ALLEGATI_MAX }),
      );
      return;
    }
    this.errore.set('');
    this.allegati.update((file) => [...file, ...scelti]);
  }

  togli(file: File): void {
    this.allegati.update((elenco) => elenco.filter((altro) => altro !== file));
  }

  /**
   * INVIA
   * Serve il testo o almeno un allegato.
   */
  invia(): void {
    const testo = this.testo.value.trim();
    if ((!testo && !this.allegati().length) || this.testo.invalid || this.inCorso()) {
      return;
    }
    this.inCorso.set(true);
    this.errore.set('');
    this.chat
      .inviaMessaggio(this.uuid(), {
        testo: testo || undefined,
        risposta_a_id: this.rispondiA()?.id,
        allegati: this.allegati(),
      })
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: (messaggio) => {
          this.testo.reset();
          this.allegati.set([]);
          this.annullaRisposta.emit();
          this.segnala(false);
          this.inviato.emit(messaggio);
        },
        error: (motivo: unknown) => this.errore.set(this.errori.messaggio(motivo)),
      });
  }

  // ponytail: l'avviso è un di più, se il socket non risponde non si mostra nulla.
  private segnala(attivo: boolean): void {
    this.socket
      .emetti(EVENTI_SOCKET.SCRIVE, { conversazione: this.uuid(), attivo })
      .subscribe({ error: () => undefined });
  }
}
