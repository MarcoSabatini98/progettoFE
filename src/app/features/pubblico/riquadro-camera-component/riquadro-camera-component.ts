import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { ICONA_SERVIZIO_PREDEFINITA } from '../../../core/services/camere/camere-costanti';
import { ComparsaDirective } from '../../../shared/directives/comparsa-directive';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { MediaInterface } from '../../../shared/models/media/media-model';
import { ServizioInterface } from '../../../shared/models/servizio/servizio-model';
import { MediaPipe } from '../../../shared/pipes/media-pipe';

/**
 * Riquadro di una tipologia o di una camera (/camere, /camere/:slug): foto grande dietro
 * (senza foto uno sfondo neutro) e sopra la card spostata di lato, alternata da un
 * riquadro all'altro. I pulsanti arrivano da fuori, in fondo alla card.
 * Compare verso il centro dello schermo: prima la foto, poi la card.
 */
@Component({
  selector: 'app-riquadro-camera',
  imports: [ComparsaDirective, IconaComponent, MediaPipe],
  templateUrl: './riquadro-camera-component.html',
  styleUrl: './riquadro-camera-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiquadroCameraComponent {
  readonly titolo = input.required<string>();
  readonly descrizione = input<string | null>();
  readonly foto = input<MediaInterface>();
  readonly dotazioni = input<ServizioInterface[]>([]);

  protected readonly iconaPredefinita = ICONA_SERVIZIO_PREDEFINITA;
}
