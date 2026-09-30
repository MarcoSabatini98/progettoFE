import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { ImportiPrenotazioneInterface } from '../models/prenotazione/prenotazione-model';
import { RiepilogoPagamentoInterface } from '../models/riepilogo-pagamento/riepilogo-pagamento-model';
import { PrezzoPipe } from '../pipes/prezzo-pipe';
import { RiepilogoPrezzoComponent } from '../riepilogo-prezzo-component/riepilogo-prezzo-component';

/** Conto di una prenotazione con quanto è già stato pagato e quanto resta. */
@Component({
  selector: 'app-conto-prenotazione',
  imports: [TranslocoPipe, PrezzoPipe, RiepilogoPrezzoComponent],
  templateUrl: './conto-prenotazione-component.html',
  styleUrl: './conto-prenotazione-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class ContoPrenotazioneComponent {
  readonly importi = input.required<ImportiPrenotazioneInterface>();
  readonly pagamento = input.required<RiepilogoPagamentoInterface>();

  /** Incassato meno i rimborsi. */
  protected readonly pagato = computed(() => {
    const { incassato, rimborsato } = this.pagamento();
    return Number(incassato ?? 0) - Number(rimborsato ?? 0);
  });
}
