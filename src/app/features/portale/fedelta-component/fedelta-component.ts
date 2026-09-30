import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { forkJoin } from 'rxjs';

import { accodaPagine } from '../../../core/services/api/pagine-accodate';
import { FedeltaService } from '../../../core/services/fedelta/fedelta-service';
import { DataPipe } from '../../../shared/pipes/data-pipe';

const MOVIMENTI_PER_PAGINA = 20;

/** Livello fedeltà del cliente, strada verso il prossimo, scala dei livelli e movimenti dei punti. */
@Component({
  selector: 'app-fedelta',
  imports: [TranslocoPipe, DataPipe],
  templateUrl: './fedelta-component.html',
  styleUrl: './fedelta-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'sezione' },
})
export class FedeltaComponent {
  private readonly fedelta = inject(FedeltaService);

  protected readonly dati = rxResource({
    stream: () =>
      forkJoin({
        situazione: this.fedelta.leggiSituazione(),
        livelli: this.fedelta.elencaLivelli(),
        statistiche: this.fedelta.leggiMieStatistiche(),
      }),
  });
  protected readonly movimenti = accodaPagine(
    (parametri) => this.fedelta.elencaMovimenti(parametri),
    MOVIMENTI_PER_PAGINA,
  );

  /** Cliente senza punti: situazione null, conta come zero. */
  protected readonly punti = computed(() =>
    this.dati.hasValue() ? (this.dati.value().situazione?.punti_fedelta ?? 0) : 0,
  );
  // I livelli arrivano dai meno punti ai più.
  protected readonly prossimo = computed(() =>
    this.dati.hasValue()
      ? this.dati.value().livelli.find((livello) => livello.punti_minimi > this.punti())
      : undefined,
  );
}
