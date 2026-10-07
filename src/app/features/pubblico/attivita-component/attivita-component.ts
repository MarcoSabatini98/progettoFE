import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PaginaSitoComponent } from '../pagina-sito-component/pagina-sito-component';

/**
 * Le attività (/attivita): cosa fare nei dintorni, feste ed eventi della zona,
 * informazioni utili e attività in struttura, scritte dallo staff nel gestionale
 * (Contenuti → Pagine).
 */
@Component({
  selector: 'app-attivita',
  imports: [PaginaSitoComponent],
  templateUrl: './attivita-component.html',
  styleUrl: './attivita-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttivitaComponent {}
