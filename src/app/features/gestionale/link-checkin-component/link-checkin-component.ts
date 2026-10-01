import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { ErroriService } from '../../../core/services/errori/errori-service';
import { PrenotazioniService } from '../../../core/services/prenotazioni/prenotazioni-service';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { LinkCopiabileComponent } from '../../../shared/link-copiabile-component/link-copiabile-component';

/** Link del check-in online da mandare all'ospite: crearne uno nuovo invalida il precedente. */
@Component({
  selector: 'app-link-checkin',
  imports: [TranslocoPipe, IconaComponent, LinkCopiabileComponent],
  templateUrl: './link-checkin-component.html',
  styleUrl: './link-checkin-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class LinkCheckinComponent {
  private readonly prenotazioni = inject(PrenotazioniService);
  private readonly errori = inject(ErroriService);

  readonly prenotazioneId = input.required<number>();

  protected readonly url = signal('');
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');

  /**
   * CREA
   */
  crea(): void {
    this.inCorso.set(true);
    this.errore.set('');
    this.prenotazioni
      .creaLinkCheckin(this.prenotazioneId())
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: (url) => this.url.set(url),
        error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
      });
  }
}
