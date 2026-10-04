import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { CalendariService } from '../../../core/services/calendari/calendari-service';
import { CamereService } from '../../../core/services/camere/camere-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { LinkCopiabileComponent } from '../../../shared/link-copiabile-component/link-copiabile-component';

/**
 * Link iCal di ogni camera da dare ai portali, che così vedono le date già occupate.
 * Un link nuovo sostituisce il vecchio, che smette subito di funzionare: si chiede conferma.
 */
@Component({
  selector: 'app-link-esportazione',
  imports: [TranslocoPipe, IconaComponent, LinkCopiabileComponent],
  templateUrl: './link-esportazione-component.html',
  styleUrl: './link-esportazione-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkEsportazioneComponent {
  private readonly calendari = inject(CalendariService);
  private readonly camere = inject(CamereService);
  protected readonly errori = inject(ErroriService);

  protected readonly link = rxResource({ stream: () => this.calendari.elencaLinkEsportazione() });
  /** Camera di cui si sta confermando il link nuovo. */
  protected readonly daConfermare = signal<number | null>(null);
  /** Camera dell'ultima richiesta: il suo errore resta sotto di lei. */
  protected readonly richiesta = signal<number | null>(null);
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');

  /**
   * CHIEDI
   */
  chiedi(cameraId: number | null): void {
    this.errore.set('');
    this.daConfermare.set(cameraId);
  }

  /**
   * NUOVO LINK
   */
  nuovoLink(cameraId: number): void {
    this.richiesta.set(cameraId);
    this.inCorso.set(true);
    this.errore.set('');
    this.camere
      .rigeneraTokenIcal(cameraId)
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: () => {
          this.daConfermare.set(null);
          this.link.reload();
        },
        error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
      });
  }
}
