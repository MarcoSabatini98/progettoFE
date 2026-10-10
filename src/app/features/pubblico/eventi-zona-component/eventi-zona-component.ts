import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';

import { ContenutiService } from '../../../core/services/contenuti/contenuti-service';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { DataPipe } from '../../../shared/pipes/data-pipe';

/**
 * "Cosa succede in zona": feste, fiere ed eventi dei prossimi giorni, inseriti dallo
 * staff in Contenuti → Eventi. Senza eventi la sezione non compare.
 */
@Component({
  selector: 'app-eventi-zona',
  imports: [TranslocoPipe, DataPipe],
  templateUrl: './eventi-zona-component.html',
  styleUrl: './eventi-zona-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventiZonaComponent {
  private readonly contenuti = inject(ContenutiService);
  private readonly lingua = inject(LinguaService);

  private readonly risorsa = rxResource({
    params: () => this.lingua.attiva(),
    stream: ({ params }) => this.contenuti.elencaEventiPubblici(params),
  });
  protected readonly eventi = computed(() => (this.risorsa.hasValue() ? this.risorsa.value() : []));
}
