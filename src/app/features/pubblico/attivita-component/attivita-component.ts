import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

/**
 * Le attività (/attivita): cosa fare nei dintorni, feste ed eventi della zona,
 * informazioni utili (distanze da aeroporti e stazioni) e attività in struttura.
 * Contenuti in arrivo.
 */
@Component({
  selector: 'app-attivita',
  imports: [TranslocoPipe],
  templateUrl: './attivita-component.html',
  styleUrl: './attivita-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class AttivitaComponent {}
