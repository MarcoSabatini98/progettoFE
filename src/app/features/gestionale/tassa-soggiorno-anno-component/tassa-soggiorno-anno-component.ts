import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';

import { AnalyticsService } from '../../../core/services/analytics/analytics-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { TassaSoggiornoMensileInterface } from '../../../shared/models/tassa-soggiorno-mensile/tassa-soggiorno-mensile-model';
import { DataPipe } from '../../../shared/pipes/data-pipe';
import { PrezzoPipe } from '../../../shared/pipes/prezzo-pipe';

/** Colonne del riepilogo; tassa è un importo. */
const CAMPI = [
  'prenotazioni',
  'ospiti',
  'notti',
  'tassa',
] as const satisfies readonly (keyof TassaSoggiornoMensileInterface)[];

/** Imposta di soggiorno di un anno mese per mese, coi totali: quel che serve alla dichiarazione. */
@Component({
  selector: 'app-tassa-soggiorno-anno',
  imports: [TranslocoPipe, DataPipe, PrezzoPipe],
  templateUrl: './tassa-soggiorno-anno-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TassaSoggiornoAnnoComponent {
  private readonly analytics = inject(AnalyticsService);
  protected readonly errori = inject(ErroriService);

  readonly anno = input.required<number>();

  protected readonly campi = CAMPI;
  protected readonly mesi = rxResource({
    params: () => this.anno(),
    stream: ({ params }) => this.analytics.elencaTassaSoggiorno(params),
  });
  protected readonly totali = computed(() => {
    const mesi = this.mesi.hasValue() ? this.mesi.value() : [];
    return CAMPI.map((campo) => mesi.reduce((somma, mese) => somma + Number(mese[campo]), 0));
  });
}
