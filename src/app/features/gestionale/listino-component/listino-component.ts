import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  contentChild,
  inject,
  input,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { ErroriService } from '../../../core/services/errori/errori-service';
import { Listino } from '../../../core/services/api/listino';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { EliminaComponent } from '../elimina-component/elimina-component';

/**
 * Una sezione del listino: elenco delle voci a sinistra, a destra il modulo (proiettato)
 * e, per la voce scelta, la scheda per eliminarla. Ogni riga la disegna il template #riga.
 * I testi sono sotto `chiave`: titolo, aiuto, nuova, vuoto, elimina, eliminaAiuto, eliminaConferma.
 */
@Component({
  selector: 'app-listino',
  imports: [NgTemplateOutlet, TranslocoPipe, EliminaComponent, IconaComponent],
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

  protected readonly riga = contentChild.required<TemplateRef<{ $implicit: T }>>('riga');
}
