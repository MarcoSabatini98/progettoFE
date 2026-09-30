import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { PERCORSI_PUBBLICI } from '../../core/services/navigazione/navigazione-costanti';

/** Pagina 404, dentro il layout dell'area in cui si trova il percorso sbagliato. */
@Component({
  selector: 'app-pagina-non-trovata',
  imports: [RouterLink, TranslocoPipe],
  templateUrl: './pagina-non-trovata-component.html',
  styleUrl: './pagina-non-trovata-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaNonTrovataComponent {
  protected readonly home = PERCORSI_PUBBLICI.home;
}
