import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DOCUMENT,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { finalize, Observable } from 'rxjs';

import { ErroriService } from '../../core/services/errori/errori-service';
import { IconaComponent } from '../icona-component/icona-component';
import { CheckoutInterface } from '../models/checkout/checkout-model';
import { MetodoOnline, PagaOnlinePayload } from '../models/pagamento/pagamento-model';
import { RiepilogoPagamentoInterface } from '../models/riepilogo-pagamento/riepilogo-pagamento-model';
import { DataPipe } from '../pipes/data-pipe';
import { PrezzoPipe } from '../pipes/prezzo-pipe';

/** Online (Stripe, PayPal) oppure bonifico, se la struttura ha impostato l'IBAN. */
type MetodoScelto = MetodoOnline | 'bonifico';

const ICONE: Record<MetodoScelto, string> = {
  stripe: 'credit_card',
  paypal: 'account_balance_wallet',
  bonifico: 'account_balance',
};

/**
 * Cosa pagare ora e come. Prima quanto (solo l'acconto o tutto), poi il metodo:
 * carta e simili con Stripe, PayPal o bonifico. Quello che non si paga ora si salda
 * in struttura. Chi la usa passa come avviare il pagamento (per codice o dall'area
 * personale). Senza nulla da pagare dice che è tutto saldato.
 */
@Component({
  selector: 'app-pagamento-prenotazione',
  imports: [TranslocoPipe, IconaComponent, PrezzoPipe, DataPipe],
  templateUrl: './pagamento-prenotazione-component.html',
  styleUrl: './pagamento-prenotazione-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[hidden]': '!situazione()' },
})
export class PagamentoPrenotazioneComponent {
  private readonly finestra = inject(DOCUMENT).defaultView;
  private readonly errori = inject(ErroriService);

  protected readonly icone = ICONE;

  readonly riepilogo = input.required<RiepilogoPagamentoInterface>();
  /** Scadenza della prenotazione in attesa: il bonifico deve arrivare prima. */
  readonly scadeIl = input<string | null>(null);
  /** Avvia il pagamento online e restituisce la pagina del provider. */
  readonly avvia =
    input.required<(pagamento: PagaOnlinePayload) => Observable<CheckoutInterface>>();

  /** Senza conti la vista dà null: vale zero. */
  private readonly saldo = computed(() => this.riepilogo().saldo ?? 0);

  /** Quanto si può pagare ora: l'acconto e tutto il saldo, se diversi. */
  protected readonly importi = computed(() =>
    [...new Set([this.riepilogo().da_pagare_ora, this.saldo()])].filter((importo) => importo > 0),
  );
  protected readonly importo = linkedSignal(() => this.importi()[0] ?? 0);
  protected readonly restoInStruttura = computed(() => this.saldo() - this.importo());

  protected readonly metodi = computed<MetodoScelto[]>(() => {
    const { metodi_online, bonifico } = this.riepilogo();
    return bonifico ? [...metodi_online, 'bonifico'] : metodi_online;
  });
  protected readonly metodo = linkedSignal<MetodoScelto | undefined>(() => this.metodi()[0]);

  protected readonly inPagamento = signal(false);
  protected readonly errore = signal('');
  protected readonly situazione = computed(() => {
    if (this.importi().length) {
      return 'da_pagare';
    }
    return this.saldo() === 0 ? 'pagato' : undefined;
  });

  /**
   * PAGA
   * Apre la pagina di Stripe o PayPal, che poi rimanda all'esito del pagamento.
   * Il bonifico non ha nulla da avviare: bastano i dati mostrati.
   */
  paga(): void {
    const metodo = this.metodo();
    if (!metodo || metodo === 'bonifico') {
      return;
    }
    this.inPagamento.set(true);
    this.errore.set('');
    this.avvia()({ metodo, importo: this.importo() })
      .pipe(finalize(() => this.inPagamento.set(false)))
      .subscribe({
        next: ({ url }) => this.finestra?.location.assign(url),
        error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
      });
  }
}
