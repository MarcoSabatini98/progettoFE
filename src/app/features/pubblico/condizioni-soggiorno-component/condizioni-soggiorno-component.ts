import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';

import { CHIAVI_IMPOSTAZIONI } from '../../../core/services/impostazioni/impostazioni-costanti';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { TariffeService } from '../../../core/services/tariffe/tariffe-service';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { PrezzoPipe } from '../../../shared/pipes/prezzo-pipe';
import { VariazionePipe } from '../../../shared/pipes/variazione-pipe';

/**
 * "Il soggiorno", di lato nella pagina di una camera: orari di check-in e check-out,
 * ogni tariffa attiva con la sua regola di cancellazione e la tassa di soggiorno.
 * Uguale per tutte le camere: la struttura ha un solo listino di piani.
 */
@Component({
  selector: 'app-condizioni-soggiorno',
  imports: [TranslocoPipe, IconaComponent, PrezzoPipe, VariazionePipe],
  templateUrl: './condizioni-soggiorno-component.html',
  styleUrl: './condizioni-soggiorno-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class CondizioniSoggiornoComponent {
  private readonly tariffe = inject(TariffeService);
  private readonly impostazioni = inject(ImpostazioniService);

  protected readonly checkin = computed(() =>
    this.impostazioni.testo(CHIAVI_IMPOSTAZIONI.orarioCheckin),
  );
  protected readonly checkout = computed(() =>
    this.impostazioni.testo(CHIAVI_IMPOSTAZIONI.orarioCheckout),
  );
  private readonly condizioni = rxResource({
    stream: () => this.tariffe.leggiCondizioniSoggiorno(),
  });
  /** I DECIMAL arrivano come testo: la variazione diventa un numero per il segno. */
  protected readonly piani = computed(() =>
    (this.condizioni.hasValue() ? this.condizioni.value().piani : []).map((piano) => ({
      ...piano,
      variazione: Number(piano.valore_variazione),
    })),
  );
  protected readonly tassa = computed(() =>
    this.condizioni.hasValue() ? this.condizioni.value().tassa : null,
  );
}
