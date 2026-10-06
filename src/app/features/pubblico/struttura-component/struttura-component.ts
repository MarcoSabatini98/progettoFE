import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

/**
 * La struttura (/struttura): spazi, servizi e storia della casa. Contenuti in arrivo.
 */
@Component({
  selector: 'app-struttura',
  imports: [TranslocoPipe],
  templateUrl: './struttura-component.html',
  styleUrl: './struttura-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class StrutturaComponent {}
