import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  model,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { RIGHE_PER_PAGINA, numeriPagina } from '../../core/services/api/stato-pagine';
import { IconaComponent } from '../icona-component/icona-component';
import { PaginaInterface } from '../models/pagina/pagina-model';

let progressivo = 0;

/**
 * Righe per pagina e pagine di un elenco (stato da statoPagine):
 *
 *   <app-paginazione [risultato]="risultato" [(pagina)]="pagine.pagina" [(perPagina)]="pagine.perPagina" />
 *
 * Nasconde le pagine se è una sola, e tutto se le righe stanno nella scelta più piccola.
 */
@Component({
  selector: 'app-paginazione',
  imports: [TranslocoPipe, IconaComponent],
  templateUrl: './paginazione-component.html',
  styleUrl: './paginazione-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginazioneComponent {
  readonly risultato =
    input.required<Pick<PaginaInterface<unknown>, 'pagina' | 'pagine' | 'totale'>>();
  /** Mentre si carica una pagina non se ne chiede un'altra. */
  readonly occupato = input(false, { transform: booleanAttribute });
  readonly pagina = model.required<number>();
  readonly perPagina = model.required<number>();

  protected readonly righe = RIGHE_PER_PAGINA;
  protected readonly idRighe = `righe-per-pagina-${++progressivo}`;
  protected readonly numeri = computed(() =>
    numeriPagina(this.risultato().pagina, this.risultato().pagine),
  );

  /**
   * SCEGLI RIGHE
   * Nuovo numero di righe dal menu a tendina.
   */
  scegliRighe(evento: Event): void {
    this.perPagina.set(Number((evento.target as HTMLSelectElement).value));
  }
}
