import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { SezioneInterface } from '../../../shared/models/sezione/sezione-model';
import { MediaPipe } from '../../../shared/pipes/media-pipe';

/**
 * Sezioni immagine-testo scritte dallo staff: l'immagine si alterna a sinistra e a destra
 * e ogni sezione compare scorrendo. Senza immagine resta il solo testo.
 */
@Component({
  selector: 'app-sezioni',
  imports: [MediaPipe],
  templateUrl: './sezioni-component.html',
  styleUrl: './sezioni-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SezioniComponent {
  readonly sezioni = input.required<SezioneInterface[]>();
}
