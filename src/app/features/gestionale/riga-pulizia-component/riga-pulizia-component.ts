import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import { minutiPulizia } from '../../../core/services/pulizie/passaggi-pulizia';
import { AttivitaPuliziaInterface } from '../../../shared/models/attivita-pulizia/attivita-pulizia-model';

/** Priorità segnalate sulla riga: le altre non distraggono. */
const PRIORITA_EVIDENTI = new Set(['alta', 'urgente']);

/**
 * Attività di pulizia in un elenco: camera, tipo, addetto, voci spuntate e stato,
 * con il collegamento alla scheda.
 */
@Component({
  selector: 'app-riga-pulizia',
  imports: [RouterLink, TranslocoPipe],
  templateUrl: './riga-pulizia-component.html',
  styleUrl: './riga-pulizia-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class RigaPuliziaComponent {
  readonly attivita = input.required<AttivitaPuliziaInterface>();
  /** Mostra quanto è durata la pulizia (a chi gestisce). */
  readonly tempi = input(false);

  protected readonly scheda = PERCORSI_STAFF.pulizie;
  protected readonly evidente = computed(() => PRIORITA_EVIDENTI.has(this.attivita().priorita));
  protected readonly fatte = computed(
    () => (this.attivita().checklist ?? []).filter((riga) => riga.fatto).length,
  );
  protected readonly minuti = computed(() =>
    this.tempi() ? minutiPulizia(this.attivita()) : null,
  );
  /** Non disturbare: ancora da fare, in fondo alla coda. */
  protected readonly rinviata = computed(
    () => !!this.attivita().rinviata_il && this.attivita().stato === 'da_fare',
  );
}
