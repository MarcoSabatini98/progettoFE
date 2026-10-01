import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../../core/services/auth/auth-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { PagamentiService } from '../../../core/services/pagamenti/pagamenti-service';
import { PERMESSI } from '../../../core/services/ruoli/ruoli-costanti';
import { PrenotazioneInterface } from '../../../shared/models/prenotazione/prenotazione-model';
import { DataPipe } from '../../../shared/pipes/data-pipe';
import { PrezzoPipe } from '../../../shared/pipes/prezzo-pipe';
import { LinkPagamentoComponent } from '../link-pagamento-component/link-pagamento-component';
import { RegistraIncassoComponent } from '../registra-incasso-component/registra-incasso-component';

/**
 * Movimenti di denaro della prenotazione; chi può registrare incassa in struttura
 * o manda all'ospite un link di pagamento online.
 */
@Component({
  selector: 'app-incassi-prenotazione',
  imports: [TranslocoPipe, DataPipe, PrezzoPipe, LinkPagamentoComponent, RegistraIncassoComponent],
  templateUrl: './incassi-prenotazione-component.html',
  styleUrl: './incassi-prenotazione-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class IncassiPrenotazioneComponent {
  private readonly pagamenti = inject(PagamentiService);
  protected readonly errori = inject(ErroriService);

  /** Ogni nuova versione della prenotazione ricarica i movimenti. */
  readonly prenotazione = input.required<PrenotazioneInterface>();
  /** Incasso registrato: cambia il saldo della prenotazione. */
  readonly aggiornata = output();

  protected readonly registra = inject(AuthService).haPermessi([PERMESSI.PAGAMENTI_REGISTRA]);
  protected readonly dati = rxResource({
    params: () => this.prenotazione(),
    stream: ({ params: { id } }) =>
      forkJoin({
        movimenti: this.pagamenti.elencaPagamentiPrenotazione(id),
        riepilogo: this.pagamenti.leggiRiepilogo(id),
      }),
  });
}
