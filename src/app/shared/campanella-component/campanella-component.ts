import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AvvisiService } from '../../core/services/avvisi/avvisi-service';
import { EVENTI_SOCKET } from '../../core/services/chat/chat-costanti';
import { ErroriService } from '../../core/services/errori/errori-service';
import {
  ICONE_NOTIFICA,
  MASSIMO_CONTATORE_NOTIFICHE,
  PARAMETRI_DATA_NOTIFICA,
  ULTIME_NOTIFICHE,
} from '../../core/services/notifiche/notifiche-costanti';
import { NotificheService } from '../../core/services/notifiche/notifiche-service';
import { SocketService } from '../../core/services/socket/socket-service';
import { chiudiPopover } from '../../layout/chiudi-popover';
import { NotificaInterface, ParametriNotifica } from '../models/notifica/notifica-model';
import { IconaComponent } from '../icona-component/icona-component';
import { DataPipe } from '../pipes/data-pipe';

/**
 * Campanella di chi ha fatto l'accesso (staff e clienti): contatore delle non lette
 * e ultime notifiche in un popover.
 * Le nuove arrivano dal socket; al clic la notifica diventa letta e apre il suo link.
 */
@Component({
  selector: 'app-campanella',
  imports: [TranslocoPipe, IconaComponent, DataPipe],
  providers: [DataPipe],
  templateUrl: './campanella-component.html',
  styleUrl: './campanella-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampanellaComponent {
  private readonly notificheService = inject(NotificheService);
  private readonly router = inject(Router);
  private readonly avvisi = inject(AvvisiService);
  protected readonly errori = inject(ErroriService);
  private readonly data = inject(DataPipe);
  protected readonly icone = ICONE_NOTIFICA;

  protected readonly elenco = rxResource({
    stream: () => this.notificheService.elencaNotifiche({ perPagina: ULTIME_NOTIFICHE }),
  });
  protected readonly notifiche = linkedSignal(() =>
    this.elenco.hasValue() ? this.elenco.value().elementi : [],
  );
  protected readonly nonLette = linkedSignal(() =>
    this.elenco.hasValue() ? this.elenco.value().non_lette : 0,
  );
  /** Ogni notifica con la chiave del titolo tradotto e i suoi parametri. */
  protected readonly voci = computed(() =>
    this.notifiche().map((notifica) => ({
      notifica,
      chiave: `notifiche.codici.${notifica.codice}`,
      valori: this.parametri(notifica),
    })),
  );
  protected readonly contatore = computed(() =>
    this.nonLette() > MASSIMO_CONTATORE_NOTIFICHE
      ? `${MASSIMO_CONTATORE_NOTIFICHE}+`
      : String(this.nonLette()),
  );

  constructor() {
    inject(SocketService)
      .ascolta<NotificaInterface>(EVENTI_SOCKET.NOTIFICA)
      .pipe(takeUntilDestroyed())
      .subscribe((nuova) => {
        this.notifiche.update((elenco) => [nuova, ...elenco].slice(0, ULTIME_NOTIFICHE));
        this.nonLette.update((totale) => totale + 1);
      });
  }

  /** Parametri del titolo tradotto, con le date nella lingua del sito. */
  private parametri(notifica: NotificaInterface): ParametriNotifica {
    const parametri = { ...notifica.parametri };
    for (const chiave of PARAMETRI_DATA_NOTIFICA) {
      if (typeof parametri[chiave] === 'string') {
        parametri[chiave] = this.data.transform(parametri[chiave]);
      }
    }
    return parametri;
  }

  protected apri(notifica: NotificaInterface, pannello: HTMLElement): void {
    if (!notifica.letta_il) {
      this.notificheService.segnaLetta(notifica.id).subscribe({
        next: (letta) => this.sostituisci(letta),
        error: (motivo: unknown) => this.mostraErrore(motivo),
      });
    }
    if (notifica.link) {
      chiudiPopover(pannello);
      void this.router.navigateByUrl(notifica.link);
    }
  }

  protected segnaTutte(): void {
    this.notificheService.segnaTutteLette().subscribe({
      next: () => {
        const adesso = new Date().toISOString();
        this.notifiche.update((elenco) =>
          elenco.map((notifica) => ({ ...notifica, letta_il: notifica.letta_il ?? adesso })),
        );
        this.nonLette.set(0);
      },
      error: (motivo: unknown) => this.mostraErrore(motivo),
    });
  }

  protected elimina(notifica: NotificaInterface): void {
    this.notificheService.eliminaNotifica(notifica.id).subscribe({
      next: () => {
        this.notifiche.update((elenco) => elenco.filter((voce) => voce.id !== notifica.id));
        if (!notifica.letta_il) {
          this.nonLette.update((totale) => totale - 1);
        }
      },
      error: (motivo: unknown) => this.mostraErrore(motivo),
    });
  }

  private sostituisci(letta: NotificaInterface): void {
    this.notifiche.update((elenco) =>
      elenco.map((notifica) => (notifica.id === letta.id ? letta : notifica)),
    );
    this.nonLette.update((totale) => totale - 1);
  }

  private mostraErrore(motivo: unknown): void {
    this.avvisi.mostra(this.errori.messaggio(motivo), 'errore');
  }
}
