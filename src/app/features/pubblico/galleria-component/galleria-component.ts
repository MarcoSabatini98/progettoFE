import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { MediaInterface } from '../../../shared/models/media/media-model';
import { MediaPipe } from '../../../shared/pipes/media-pipe';

/**
 * Striscia di foto che scorre col dito (scroll-snap nativo) o coi pulsanti.
 * Da tastiera la striscia prende il focus e scorre con le frecce.
 */
@Component({
  selector: 'app-galleria',
  imports: [TranslocoPipe, IconaComponent, MediaPipe],
  templateUrl: './galleria-component.html',
  styleUrl: './galleria-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleriaComponent {
  readonly media = input.required<MediaInterface[]>();
  /** Nome della galleria per i lettori di schermo. */
  readonly etichetta = input.required<string>();

  /** Una schermata avanti o indietro: l'animazione la decide il CSS (scroll-behavior). */
  protected scorri(striscia: HTMLElement, verso: 1 | -1): void {
    striscia.scrollBy({ left: verso * striscia.clientWidth });
  }
}
