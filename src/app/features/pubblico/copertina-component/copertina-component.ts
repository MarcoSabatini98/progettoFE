import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { MediaInterface } from '../../../shared/models/media/media-model';
import { MediaPipe } from '../../../shared/pipes/media-pipe';
import { ScorriComponent } from '../scorri-component/scorri-component';

/**
 * Copertina di una pagina del sito: con la foto riempie lo schermo (.copertina-schermo
 * in pagine.css) e invita a scorrere; senza resta un'intestazione normale.
 * Titolo e testi arrivano già tradotti.
 */
@Component({
  selector: 'app-copertina',
  imports: [MediaPipe, ScorriComponent],
  templateUrl: './copertina-component.html',
  styleUrl: './copertina-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'copertina', '[class.copertina-schermo]': 'foto()' },
})
export class CopertinaComponent {
  readonly foto = input<MediaInterface>();
  readonly occhiello = input<string>();
  readonly titolo = input.required<string>();
  readonly testo = input<string | null>();
  /** Falso quando sotto non c'è niente da raggiungere. */
  readonly scorri = input(true);
}
