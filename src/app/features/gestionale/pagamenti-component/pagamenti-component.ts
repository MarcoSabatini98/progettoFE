import { ChangeDetectionStrategy, Component, inject, linkedSignal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { map } from 'rxjs';

import { giornoDopo } from '../../../core/services/disponibilita/date-soggiorno';
import { ErroriService } from '../../../core/services/errori/errori-service';
import {
  METODI_PAGAMENTO,
  STATI_PAGAMENTO,
  TIPI_PAGAMENTO,
} from '../../../core/services/pagamenti/pagamenti-costanti';
import { PagamentiService } from '../../../core/services/pagamenti/pagamenti-service';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import {
  FiltriPagamenti,
  MetodoPagamento,
  StatoPagamento,
  TipoPagamento,
} from '../../../shared/models/pagamento/pagamento-model';
import { PaginazioneComponent } from '../../../shared/paginazione-component/paginazione-component';
import { RigaPagamentoComponent } from '../riga-pagamento-component/riga-pagamento-component';

const PAGAMENTI_PER_PAGINA = 20;

/**
 * Tutti i movimenti di denaro, i più recenti in cima, filtrati per periodo, stato,
 * metodo e tipo. Annullare e rimborsare si fa dalla scheda della prenotazione, dove si vede il saldo.
 */
@Component({
  selector: 'app-pagamenti',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    CampoComponent,
    PaginazioneComponent,
    RigaPagamentoComponent,
  ],
  templateUrl: './pagamenti-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class PagamentiComponent {
  private readonly pagamenti = inject(PagamentiService);
  protected readonly errori = inject(ErroriService);

  protected readonly scelte = {
    stati: STATI_PAGAMENTO,
    metodi: METODI_PAGAMENTO,
    tipi: TIPI_PAGAMENTO,
  };
  protected readonly filtri = inject(NonNullableFormBuilder).group({
    dal: '',
    al: '',
    stato: '' as StatoPagamento | '',
    metodo: '' as MetodoPagamento | '',
    tipo: '' as TipoPagamento | '',
  });
  private readonly scelti = toSignal(
    this.filtri.valueChanges.pipe(map(() => this.filtri.getRawValue())),
    { initialValue: this.filtri.getRawValue() },
  );
  /** Cambiando i filtri si riparte dalla prima pagina. */
  protected readonly pagina = linkedSignal({ source: this.scelti, computation: () => 1 });
  protected readonly elenco = rxResource({
    params: () => this.parametri(),
    stream: ({ params }) => this.pagamenti.elencaPagamenti(params),
  });

  /**
   * SFOGLIA
   * Avanti o indietro di una pagina.
   */
  sfoglia(passo: number): void {
    this.pagina.update((numero) => numero + passo);
  }

  // Il backend esclude il giorno «al»: per chi sceglie le date è compreso.
  private parametri(): FiltriPagamenti {
    const { dal, al, stato, metodo, tipo } = this.scelti();
    return {
      dal: dal || undefined,
      al: al ? giornoDopo(al) : undefined,
      stato: stato ? [stato] : [],
      metodo: metodo ? [metodo] : [],
      tipo: tipo ? [tipo] : [],
      pagina: this.pagina(),
      perPagina: PAGAMENTI_PER_PAGINA,
    };
  }
}
