import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { debounceTime, merge } from 'rxjs';

import { AuthService } from '../../../core/services/auth/auth-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import {
  EVENTI_SOCKET,
  STATI_CONVERSAZIONE,
  STATI_PRESENZA,
  TIPI_CONVERSAZIONE,
} from '../../../core/services/chat/chat-costanti';
import { ChatService } from '../../../core/services/chat/chat-service';
import { PresenzeService } from '../../../core/services/chat/presenze-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import { PERMESSI } from '../../../core/services/ruoli/ruoli-costanti';
import { SocketService } from '../../../core/services/socket/socket-service';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import {
  FiltriConversazioni,
  StatoConversazione,
  StatoPresenza,
  TipoConversazione,
} from '../../../shared/models/conversazione/conversazione-model';
import { PaginazioneComponent } from '../../../shared/paginazione-component/paginazione-component';
import { RigaConversazioneComponent } from '../riga-conversazione-component/riga-conversazione-component';

/** Attesa dopo l'ultimo evento prima di ricaricare l'elenco: una raffica, un solo ricarico. */
const RITARDO_RICARICO_MS = 300;

/**
 * Chat dello staff: elenco a sinistra (colleghi o assistenza), conversazione aperta
 * a destra. Su mobile si vede una cosa alla volta. Si aggiorna con il socket.
 */
@Component({
  selector: 'app-chat',
  imports: [
    RouterLink,
    RouterOutlet,
    TranslocoPipe,
    CampoComponent,
    IconaComponent,
    PaginazioneComponent,
    RigaConversazioneComponent,
  ],
  templateUrl: './chat-component.html',
  styleUrl: './chat-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina', '[class.aperta]': 'aperta()' },
})
export class ChatComponent {
  private readonly chat = inject(ChatService);
  private readonly avvisi = inject(AvvisiService);
  protected readonly presenze = inject(PresenzeService);
  protected readonly errori = inject(ErroriService);

  protected readonly nuova = PERCORSI_STAFF.nuovaChat;
  protected readonly tipi = TIPI_CONVERSAZIONE;
  protected readonly statiConversazione = STATI_CONVERSAZIONE;
  protected readonly statiPresenza = STATI_PRESENZA;
  protected readonly assistenza = inject(AuthService).haPermessi([PERMESSI.CHAT_ASSISTENZA]);
  protected readonly tipo = signal<TipoConversazione>('staff');
  protected readonly stato = signal<StatoConversazione>('aperta');
  protected readonly assegnate = signal<FiltriConversazioni['assegnate']>(undefined);
  /** Cambiando filtro si riparte dalla prima pagina. */
  protected readonly pagina = linkedSignal({
    source: () => [this.tipo(), this.stato(), this.assegnate()],
    computation: () => 1,
  });
  /** C'è una conversazione (o la nuova chat) nel riquadro di destra. */
  protected readonly aperta = signal(false);
  protected readonly conversazioni = rxResource({
    params: () => ({
      tipo: this.tipo(),
      stato: this.stato(),
      assegnate: this.tipo() === 'assistenza' ? this.assegnate() : undefined,
      pagina: this.pagina(),
    }),
    stream: ({ params }) => this.chat.elencaConversazioni(params),
  });
  protected readonly nonLetti = rxResource({ stream: () => this.chat.contaNonLetti() });
  /** Badge di ogni scheda: all'assistenza contano anche quelle da prendere. */
  protected readonly contatori = computed(() => {
    const conti = this.nonLetti.value();
    return {
      staff: conti?.staff ?? 0,
      assistenza: (conti?.assistenza ?? 0) + (conti?.libere ?? 0),
    };
  });

  constructor() {
    const socket = inject(SocketService);
    merge(
      socket.ascolta(EVENTI_SOCKET.MESSAGGIO),
      socket.ascolta(EVENTI_SOCKET.CONVERSAZIONE),
      socket.ascolta(EVENTI_SOCKET.LETTO),
    )
      .pipe(debounceTime(RITARDO_RICARICO_MS), takeUntilDestroyed())
      .subscribe(() => {
        this.conversazioni.reload();
        this.nonLetti.reload();
      });
  }

  /**
   * SFOGLIA
   * Avanti o indietro di una pagina.
   */
  sfoglia(passo: number): void {
    this.pagina.update((numero) => numero + passo);
  }

  /**
   * CAMBIA PRESENZA
   * Il server lo annuncia a tutto lo staff, compreso chi lo ha scelto.
   */
  cambiaPresenza(stato: string): void {
    this.presenze.imposta(stato as StatoPresenza).subscribe({
      next: (esito) => {
        if (esito.errore) {
          this.avvisi.mostra(this.errori.testo(esito.errore), 'errore');
        }
      },
      error: (motivo: unknown) => this.avvisi.mostra(this.errori.messaggio(motivo), 'errore'),
    });
  }
}
