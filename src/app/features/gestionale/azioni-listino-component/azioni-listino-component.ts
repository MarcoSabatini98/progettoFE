import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { Listino } from '../../../core/services/tariffe/listino';
import { IconaComponent } from '../../../shared/icona-component/icona-component';

/** Fondo del modulo di una voce del listino: errore del backend, salva e annulla. */
@Component({
  selector: 'app-azioni-listino',
  imports: [TranslocoPipe, IconaComponent],
  templateUrl: './azioni-listino-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'modulo-scheda' },
})
export class AzioniListinoComponent<T extends { id: number }> {
  readonly listino = input.required<Listino<T, unknown>>();
}
