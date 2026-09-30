import { ChangeDetectionStrategy, Component, inject, input, linkedSignal } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { UtentiService } from '../../../core/services/utenti/utenti-service';

/** Email facoltative (riepiloghi della chat, promemoria): si salvano al clic. */
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

  /** Valore salvato nel profilo. */
  readonly attive = input.required<boolean>();

  /** Ultimo valore salvato: parte dal profilo e segue i salvataggi riusciti. */
  protected readonly salvate = linkedSignal(() => this.attive());

  /**
   * CAMBIA
   * Salva subito; se il backend rifiuta la casella torna com'era.
   */
  protected cambia(casella: HTMLInputElement): void {
    const attive = casella.checked;
    this.utenti.aggiornaPreferenzeEmail(attive).subscribe({
      next: () => {
        this.salvate.set(attive);
        this.avvisi.mostra(this.transloco.translate('profilo.salvato'), 'successo');
      },
      error: (errore: unknown) => {
        casella.checked = this.salvate();
        this.avvisi.mostra(this.errori.messaggio(errore), 'errore');
      },
    });
  }
}
