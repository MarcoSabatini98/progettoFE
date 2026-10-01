import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { IconaComponent } from '../icona-component/icona-component';
import { PaginaInterface } from '../models/pagina/pagina-model';

/** Pagina precedente e successiva di un elenco: compare solo se le pagine sono più di una. */
@Component({
  selector: 'app-paginazione',
  imports: [TranslocoPipe, IconaComponent],
  templateUrl: './paginazione-component.html',
  styleUrl: './paginazione-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginazioneComponent {
  readonly risultato = input.required<Pick<PaginaInterface<unknown>, 'pagina' | 'pagine'>>();
  /** Mentre si carica una pagina non se ne chiede un'altra. */
  readonly occupato = input(false, { transform: booleanAttribute });
  /** -1 o +1. */
  readonly sfoglia = output<number>();
}
