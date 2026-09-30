import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DOCUMENT,
  inject,
  input,
  signal,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { finalize, Observable } from 'rxjs';

import { ErroriService } from '../../core/services/errori/errori-service';
import { IconaComponent } from '../icona-component/icona-component';
import { CheckoutInterface } from '../models/checkout/checkout-model';
import { MetodoOnline } from '../models/pagamento/pagamento-model';
import { RiepilogoPagamentoInterface } from '../models/riepilogo-pagamento/riepilogo-pagamento-model';
import { PrezzoPipe } from '../pipes/prezzo-pipe';

/**
 * Cosa pagare ora e come: Stripe, PayPal o bonifico. Chi la usa passa come avviare
 * il pagamento (per codice o dall'area personale). Senza nulla da pagare dice che è
 * tutto saldato; se resta un saldo da pagare in struttura non compare.
 */
@Component({
  selector: 'app-pagamento-prenotazione',
  imports: [TranslocoPipe, IconaComponent, PrezzoPipe],
  templateUrl: './pagamento-prenotazione-component.html',
  styleUrl: './pagamento-prenotazione-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[hidden]': '!situazione()' },
})
export class PagamentoPrenotazioneComponent {
  private readonly finestra = inject(DOCUMENT).defaultView;
  private readonly errori = inject(ErroriService);

  readonly riepilogo = input.required<RiepilogoPagamentoInterface>();
  /** Avvia il pagamento online e restituisce la pagina del provider. */
  readonly avvia = input.required<(metodo: MetodoOnline) => Observable<CheckoutInterface>>();

  protected readonly inPagamento = signal<MetodoOnline | undefined>(undefined);
  protected readonly errore = signal('');
  protected readonly situazione = computed(() => {
    const { da_pagare_ora, saldo } = this.riepilogo();
    if (da_pagare_ora > 0) {
      return 'da_pagare';
    }
    return saldo === 0 ? 'pagato' : undefined;
  });

  /**
   * PAGA
   * Apre la pagina di Stripe o PayPal, che poi rimanda all'esito del pagamento.
   */
  paga(metodo: MetodoOnline): void {
    this.inPagamento.set(metodo);
    this.errore.set('');
    this.avvia()(metodo)
      .pipe(finalize(() => this.inPagamento.set(undefined)))
      .subscribe({
        next: ({ url }) => this.finestra?.location.assign(url),
        error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
      });
  }
}
