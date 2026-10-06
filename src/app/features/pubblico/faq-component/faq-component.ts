import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { PERCORSI_PUBBLICI } from '../../../core/services/navigazione/navigazione-costanti';
import { ElencoFaqComponent } from '../../../shared/elenco-faq-component/elenco-faq-component';

/**
 * Domande frequenti (/faq): le stesse del widget della chat, a pagina intera.
 * In fondo il rimando ai contatti per le domande che mancano.
 */
@Component({
  selector: 'app-faq',
  imports: [RouterLink, TranslocoPipe, ElencoFaqComponent],
  templateUrl: './faq-component.html',
  styleUrl: './faq-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class FaqComponent {
  protected readonly contatti = PERCORSI_PUBBLICI.contatti;
}
