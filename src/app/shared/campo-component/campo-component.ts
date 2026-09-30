import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { IconaComponent } from '../icona-component/icona-component';

/**
 * Campo di un modulo: etichetta sopra, controllo nativo proiettato, aiuto o errore sotto.
 *
 *   <app-campo [etichetta]="'accesso.email' | transloco" [errore]="erroreEmail()">
 *     <input type="email" formControlName="email" />
 *   </app-campo>
 */
@Component({
  selector: 'app-campo',
  imports: [IconaComponent],
  templateUrl: './campo-component.html',
  styleUrl: './campo-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampoComponent {
  readonly etichetta = input.required<string>();
  readonly aiuto = input('');
  /** Testo già tradotto; vuoto = nessun errore. */
  readonly errore = input('');
}
