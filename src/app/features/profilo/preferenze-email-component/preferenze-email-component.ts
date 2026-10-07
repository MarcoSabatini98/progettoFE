import { ChangeDetectionStrategy, Component, inject, input, linkedSignal } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { UtentiService } from '../../../core/services/utenti/utenti-service';
import { PreferenzeEmailInterface } from '../../../shared/models/utente/utente-model';

/** Caselle del profilo, nell'ordine in cui compaiono. */
const VOCI: { campo: keyof PreferenzeEmailInterface; etichetta: string; aiuto: string }[] = [
  { campo: 'notifiche_email', etichetta: 'profilo.notifiche', aiuto: 'profilo.notificheAiuto' },
  { campo: 'email_marketing', etichetta: 'profilo.offerte', aiuto: 'profilo.offerteAiuto' },
];

/** Email facoltative (riepiloghi e promemoria, offerte): si salvano al clic. */
@Component({
  selector: 'app-preferenze-email',
  imports: [TranslocoPipe],
  templateUrl: './preferenze-email-component.html',
  styleUrls: ['../profilo-sezioni.css', './preferenze-email-component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreferenzeEmailComponent {
  private readonly utenti = inject(UtentiService);
  private readonly avvisi = inject(AvvisiService);
  private readonly errori = inject(ErroriService);
  private readonly transloco = inject(TranslocoService);

  /** Valori salvati nel profilo. */
  readonly preferenze = input.required<PreferenzeEmailInterface>();

  protected readonly voci = VOCI;
  /** Ultimi valori salvati: partono dal profilo e seguono i salvataggi riusciti. */
  protected readonly salvate = linkedSignal(() => this.preferenze());

  /**
   * CAMBIA
   * Salva subito la sola voce toccata; se il backend rifiuta la casella torna com'era.
   */
  protected cambia(campo: keyof PreferenzeEmailInterface, casella: HTMLInputElement): void {
    this.utenti.aggiornaPreferenzeEmail({ [campo]: casella.checked }).subscribe({
      next: (salvate) => {
        this.salvate.set(salvate);
        this.avvisi.mostra(this.transloco.translate('profilo.salvato'), 'successo');
      },
      error: (errore: unknown) => {
        casella.checked = this.salvate()[campo];
        this.avvisi.mostra(this.errori.messaggio(errore), 'errore');
      },
    });
  }
}
