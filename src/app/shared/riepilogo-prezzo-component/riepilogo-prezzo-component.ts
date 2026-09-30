import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { ImportiPrenotazioneInterface } from '../models/prenotazione/prenotazione-model';
import { PrezzoPipe } from '../pipes/prezzo-pipe';

/** Voci nell'ordine del conto: gli sconti si sottraggono. */
const VOCI_PREZZO = [
  { campo: 'importo_soggiorno', sconto: false },
  { campo: 'sconto_promozione', sconto: true },
  { campo: 'sconto_codice', sconto: true },
  { campo: 'sconto_fedelta', sconto: true },
  { campo: 'importo_pacchetto', sconto: false },
  { campo: 'importo_servizi', sconto: false },
  { campo: 'tassa_soggiorno', sconto: false },
] as const;

/**
 * Conto di un preventivo o di una prenotazione: soggiorno, sconti, pacchetto, extra,
 * tassa, totale e acconto. Le voci a zero non compaiono, il soggiorno sempre.
 */
@Component({
  selector: 'app-riepilogo-prezzo',
  imports: [TranslocoPipe, PrezzoPipe],
  templateUrl: './riepilogo-prezzo-component.html',
  styleUrl: './riepilogo-prezzo-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiepilogoPrezzoComponent {
  readonly importi = input.required<ImportiPrenotazioneInterface>();

  protected readonly voci = computed(() => {
    const importi = this.importi();
    return VOCI_PREZZO.map((voce) => ({ ...voce, importo: Number(importi[voce.campo]) })).filter(
      (voce) => voce.importo > 0 || voce.campo === 'importo_soggiorno',
    );
  });
  protected readonly acconto = computed(() => Number(this.importi().acconto_richiesto));
}
