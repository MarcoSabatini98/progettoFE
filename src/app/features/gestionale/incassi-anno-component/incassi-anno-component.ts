import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';

import { AnalyticsService } from '../../../core/services/analytics/analytics-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { METODI_PAGAMENTO } from '../../../core/services/pagamenti/pagamenti-costanti';
import { IncassoMensileInterface } from '../../../shared/models/incasso-mensile/incasso-mensile-model';
import { DataPipe } from '../../../shared/pipes/data-pipe';
import { PrezzoPipe } from '../../../shared/pipes/prezzo-pipe';

/**
 * Incassi netti di un anno: un mese per riga, un metodo per colonna (solo quelli
 * usati), coi totali. Rimborsi già sottratti.
 */
@Component({
  selector: 'app-incassi-anno',
  imports: [TranslocoPipe, DataPipe, PrezzoPipe],
  templateUrl: './incassi-anno-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncassiAnnoComponent {
  private readonly analytics = inject(AnalyticsService);
  protected readonly errori = inject(ErroriService);

  readonly anno = input.required<number>();

  protected readonly incassi = rxResource({
    params: () => this.anno(),
    stream: ({ params }) => this.analytics.elencaIncassi(params),
  });
  protected readonly tabella = computed(() =>
    this.incassi.hasValue() ? tabellaIncassi(this.incassi.value()) : null,
  );
}

/** Mesi per riga, metodi per colonna nell'ordine di sempre, totali per riga e per colonna. */
function tabellaIncassi(incassi: IncassoMensileInterface[]) {
  const netto = (scelto: (incasso: IncassoMensileInterface) => boolean) =>
    incassi.filter(scelto).reduce((somma, incasso) => somma + Number(incasso.netto), 0);
  const metodi = METODI_PAGAMENTO.filter((metodo) => incassi.some((i) => i.metodo === metodo));
  const mesi = [...new Set(incassi.map((incasso) => incasso.mese))].sort();
  return {
    metodi,
    righe: mesi.map((mese) => ({
      mese,
      celle: metodi.map((metodo) => netto((i) => i.mese === mese && i.metodo === metodo)),
      totale: netto((i) => i.mese === mese),
    })),
    totali: metodi.map((metodo) => netto((i) => i.metodo === metodo)),
    totale: netto(() => true),
  };
}
