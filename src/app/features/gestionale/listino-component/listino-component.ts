import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  signal,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { ErroriService } from '../../../core/services/errori/errori-service';
import { Listino } from '../../../core/services/api/listino';
import { VOCI_VISIBILI, archiviata, contiene } from '../../../core/services/api/voci-listino';
import { dataCalendario } from '../../../core/services/disponibilita/date-soggiorno';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { EliminaComponent } from '../elimina-component/elimina-component';

/**
 * Una sezione del listino: elenco delle voci a sinistra, a destra il modulo (proiettato)
 * e, per la voce scelta, la scheda per eliminarla. Ogni riga la disegna il template #riga.
 * I testi sono sotto `chiave`: titolo, aiuto, nuova, vuoto, elimina, eliminaAiuto, eliminaConferma.
 * Liste lunghe: ricerca, prime voci e "Mostra altre"; disattivate e scadute nascoste a richiesta.
 */
@Component({
  selector: 'app-listino',
  imports: [NgTemplateOutlet, TranslocoPipe, CampoComponent, EliminaComponent, IconaComponent],
  templateUrl: './listino-component.html',
  styleUrl: './listino-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'griglia-prenotazione' },
})
export class ListinoComponent<T extends { id: number }> {
  protected readonly errori = inject(ErroriService);

  readonly listino = input.required<Listino<T, unknown>>();
  readonly chiave = input.required<string>();
  /** false = la voce scelta non si elimina (es. un documento già pubblicato). */
  readonly eliminabile = input(true);
  /** Titolo (chiave di traduzione) del gruppo di ogni voce: le voci si dividono sotto i titoli. */
  readonly gruppo = input<(voce: T) => string>();
  /** Voci in schede piccole su più colonne invece che una sotto l'altra. */
  readonly griglia = input(false, { transform: booleanAttribute });

  protected readonly riga = contentChild.required<TemplateRef<{ $implicit: T }>>('riga');
  protected readonly cercato = signal('');
  protected readonly ancheArchiviate = signal(false);
  protected readonly tutte = signal(false);

  private readonly voci = computed(() => {
    const elenco = this.listino().elenco;
    return elenco.hasValue() ? elenco.value() : [];
  });
  /** La voce scelta resta in vista anche se archiviata, es. appena disattivata. */
  private readonly archiviate = computed(() => {
    const oggi = dataCalendario(new Date());
    const scelta = this.listino().scelta();
    return this.voci().filter((voce) => voce.id !== scelta?.id && archiviata(voce, oggi));
  });
  protected readonly totaleArchiviate = computed(() => this.archiviate().length);
  protected readonly conRicerca = computed(() => this.voci().length > VOCI_VISIBILI);
  private readonly trovate = computed(() => {
    const nascoste = this.ancheArchiviate() ? [] : this.archiviate();
    return this.voci().filter((voce) => !nascoste.includes(voce) && contiene(voce, this.cercato()));
  });
  protected readonly altre = computed(() =>
    this.tutte() ? 0 : Math.max(this.trovate().length - VOCI_VISIBILI, 0),
  );
  /** Gruppi nell'ordine della prima voce di ciascuno; senza gruppo un elenco unico senza titolo. */
  protected readonly gruppi = computed(() => {
    const trovate = this.trovate();
    const voci = this.tutte() ? trovate : trovate.slice(0, VOCI_VISIBILI);
    const gruppo = this.gruppo() ?? (() => '');
    const gruppi = new Map<string, T[]>();
    for (const voce of voci) {
      const titolo = gruppo(voce);
      gruppi.set(titolo, [...(gruppi.get(titolo) ?? []), voce]);
    }
    return [...gruppi].map(([titolo, voci]) => ({ titolo, voci }));
  });
}
