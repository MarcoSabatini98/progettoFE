import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { ErroriService } from '../../../core/services/errori/errori-service';
import { PERCORSI_PUBBLICI } from '../../../core/services/navigazione/navigazione-costanti';
import { PagamentiService } from '../../../core/services/pagamenti/pagamenti-service';
import { IconaComponent } from '../../../shared/icona-component/icona-component';

/** Icona di ogni esito mostrato. */
const ICONE_ESITO = {
  in_corso: 'hourglass_top',
  ok: 'check_circle',
  annullato: 'cancel',
  errore: 'error',
} as const;

type EsitoMostrato = keyof typeof ICONE_ESITO;

/**
 * Ritorno da Stripe o PayPal (/prenotazioni/:codice/pagamento?esito=ok|annullato).
 * PayPal aggiunge il token dell'ordine, da catturare per incassare; Stripe conferma da sé.
 */
@Component({
  selector: 'app-esito-pagamento',
  imports: [RouterLink, TranslocoPipe, IconaComponent],
  templateUrl: './esito-pagamento-component.html',
  styleUrl: './esito-pagamento-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class EsitoPagamentoComponent {
  private readonly pagamenti = inject(PagamentiService);
  protected readonly errori = inject(ErroriService);

  /** Dal percorso. */
  readonly codice = input.required<string>();
  /** Dai parametri della query. */
  readonly esito = input<string>();
  readonly token = input<string>();

  protected readonly percorsoPrenotazione = computed(() => [
    PERCORSI_PUBBLICI.prenotazioni,
    this.codice(),
  ]);
  protected readonly cattura = rxResource({
    params: () => (this.esito() === 'ok' ? this.token() : undefined),
    stream: ({ params: token }) => this.pagamenti.catturaPaypal(token),
  });
  protected readonly mostrato = computed<EsitoMostrato>(() => {
    if (this.esito() !== 'ok') {
      return 'annullato';
    }
    if (this.cattura.isLoading()) {
      return 'in_corso';
    }
    return this.cattura.error() ? 'errore' : 'ok';
  });
  protected readonly icona = computed(() => ICONE_ESITO[this.mostrato()]);
}
