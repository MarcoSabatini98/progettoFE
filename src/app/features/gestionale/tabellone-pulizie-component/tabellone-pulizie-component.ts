import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { AttivitaPuliziaInterface } from '../../../shared/models/attivita-pulizia/attivita-pulizia-model';
import {
  ColonnaPulizieInterface,
  SpostamentoPuliziaInterface,
} from '../../../shared/models/colonna-pulizie/colonna-pulizie-model';
import { RigaPuliziaComponent } from '../riga-pulizia-component/riga-pulizia-component';

/** Sul telefono si trascina tenendo premuto: un tocco breve fa scorrere la pagina. */
const RITARDO_TRASCINA = { touch: 250, mouse: 0 };

/**
 * Tabellone delle pulizie: una colonna per stato o per addetto. Le attività si trascinano
 * da una colonna all'altra; sul telefono, e da tastiera, si sceglie la colonna dal menu.
 * Si propongono solo le colonne permesse; il cambio lo fa chi usa il tabellone.
 */
@Component({
  selector: 'app-tabellone-pulizie',
  imports: [CdkDrag, CdkDropList, CdkDropListGroup, TranslocoPipe, RigaPuliziaComponent],
  templateUrl: './tabellone-pulizie-component.html',
  styleUrl: './tabellone-pulizie-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabellonePulizieComponent {
  readonly colonne = input.required<ColonnaPulizieInterface[]>();
  /** Colonne in cui l'attività può andare; nessuna = resta ferma. */
  readonly destinazioni = input.required<(attivita: AttivitaPuliziaInterface) => string[]>();
  /** Chiave i18n della voce vuota del menu: "Sposta in…", "Assegna a…". */
  readonly azione = input.required<string>();
  /** Mostra quanto è durata ogni pulizia (a chi gestisce). */
  readonly tempi = input(false);
  readonly sposta = output<SpostamentoPuliziaInterface>();

  protected readonly ritardo = RITARDO_TRASCINA;
  protected readonly perChiave = computed(
    () => new Map(this.colonne().map((colonna) => [colonna.chiave, colonna])),
  );

  /** La colonna accetta solo le attività che possono andarci. */
  protected readonly accetta = (
    trascinata: CdkDrag<AttivitaPuliziaInterface>,
    colonna: CdkDropList<string>,
  ): boolean => this.destinazioni()(trascinata.data).includes(colonna.data);

  lascia(evento: CdkDragDrop<string, string, AttivitaPuliziaInterface>): void {
    if (evento.previousContainer !== evento.container) {
      this.sposta.emit({ attivita: evento.item.data, verso: evento.container.data });
    }
  }

  /** Dal menu: la voce torna vuota, la colonna la cambia il tabellone ricaricato. */
  scegli(attivita: AttivitaPuliziaInterface, menu: HTMLSelectElement): void {
    if (menu.value) {
      this.sposta.emit({ attivita, verso: menu.value });
      menu.value = '';
    }
  }
}
