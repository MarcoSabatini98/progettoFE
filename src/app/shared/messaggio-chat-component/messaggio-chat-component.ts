import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { Observable, finalize } from 'rxjs';

import { salvaFile } from '../../core/services/api/salva-file';
import { AvvisiService } from '../../core/services/avvisi/avvisi-service';
import { TESTO_MAX } from '../../core/services/chat/chat-costanti';
import { ChatService } from '../../core/services/chat/chat-service';
import { ErroriService } from '../../core/services/errori/errori-service';
import { IconaComponent } from '../icona-component/icona-component';
import { MessaggioAllegatoInterface } from '../models/messaggio-allegato/messaggio-allegato-model';
import { MessaggioInterface } from '../models/messaggio/messaggio-model';
import { DataPipe } from '../pipes/data-pipe';

/**
 * Un messaggio della conversazione: i propri a destra, modificabili ed eliminabili;
 * gli allegati si scaricano; ogni messaggio si può citare nella risposta.
 */
@Component({
  selector: 'app-messaggio-chat',
  imports: [ReactiveFormsModule, TranslocoPipe, IconaComponent, DataPipe],
  templateUrl: './messaggio-chat-component.html',
  styleUrl: './messaggio-chat-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.mio]': 'mio()' },
})
export class MessaggioChatComponent {
  private readonly chat = inject(ChatService);
  private readonly avvisi = inject(AvvisiService);
  private readonly errori = inject(ErroriService);
  private readonly documento = inject(DOCUMENT);

  readonly messaggio = input.required<MessaggioInterface>();
  readonly mio = input(false);
  /** Il messaggio a cui risponde, se è tra quelli caricati. */
  readonly citato = input<MessaggioInterface>();
  readonly rispondi = output<MessaggioInterface>();
  readonly modificato = output<MessaggioInterface>();
  readonly eliminato = output<number>();

  protected readonly testoMax = TESTO_MAX;
  protected readonly mittente = computed(() => {
    const { mittente_utente, mittente_visitatore } = this.messaggio();
    return mittente_utente
      ? `${mittente_utente.nome} ${mittente_utente.cognome}`
      : (mittente_visitatore?.nome ?? '');
  });
  protected readonly inModifica = signal(false);
  protected readonly daEliminare = signal(false);
  protected readonly inCorso = signal(false);
  protected readonly testo = inject(NonNullableFormBuilder).control('', [
    Validators.required,
    Validators.maxLength(TESTO_MAX),
  ]);
  /** Il gruppo rende il form di Angular: ngSubmit senza ricaricare la pagina. */
  protected readonly modulo = new FormGroup({ testo: this.testo });

  /**
   * MODIFICA
   * Apre il campo con il testo attuale.
   */
  modifica(): void {
    this.testo.setValue(this.messaggio().testo);
    this.inModifica.set(true);
  }

  /**
   * SALVA
   */
  salva(): void {
    const testo = this.testo.value.trim();
    if (!testo) {
      return;
    }
    this.esegui(this.chat.modificaMessaggio(this.messaggio().id, testo), (messaggio) => {
      this.inModifica.set(false);
      this.modificato.emit(messaggio);
    });
  }

  /**
   * ELIMINA
   * Sparisce anche per gli altri.
   */
  elimina(): void {
    this.esegui(this.chat.eliminaMessaggio(this.messaggio().id), () =>
      this.eliminato.emit(this.messaggio().id),
    );
  }

  /**
   * SCARICA
   */
  scarica(allegato: MessaggioAllegatoInterface): void {
    this.chat.scaricaAllegato(allegato.id).subscribe({
      next: (file) => salvaFile(this.documento, file, allegato.nome_originale),
      error: (motivo: unknown) => this.avvisi.mostra(this.errori.messaggio(motivo), 'errore'),
    });
  }

  private esegui<T>(richiesta: Observable<T>, fatto: (esito: T) => void): void {
    this.inCorso.set(true);
    richiesta.pipe(finalize(() => this.inCorso.set(false))).subscribe({
      next: fatto,
      error: (motivo: unknown) => this.avvisi.mostra(this.errori.messaggio(motivo), 'errore'),
    });
  }
}
