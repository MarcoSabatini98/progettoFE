import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PaginaSitoComponent } from '../pagina-sito-component/pagina-sito-component';

/**
 * La struttura (/struttura): spazi, servizi e storia della casa, scritti dallo staff
 * nel gestionale (Contenuti → Pagine).
 */
@Component({
  selector: 'app-struttura',
  imports: [PaginaSitoComponent],
  templateUrl: './struttura-component.html',
  styleUrl: './struttura-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StrutturaComponent {}
