import { ChangeDetectionStrategy, Component, inject, input, numberAttribute } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AuthService } from '../../../core/services/auth/auth-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { ManutenzioneService } from '../../../core/services/manutenzione/manutenzione-service';
import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import { PERMESSI } from '../../../core/services/ruoli/ruoli-costanti';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { DataPipe } from '../../../shared/pipes/data-pipe';
import { GestioneSegnalazioneComponent } from '../gestione-segnalazione-component/gestione-segnalazione-component';

/**
 * Scheda di una segnalazione (anche dai link delle notifiche): cosa non va, dove e chi
 * se ne occupa. Chi gestisce la manutenzione la prende in carico e la chiude da qui.
 */
@Component({
  selector: 'app-scheda-segnalazione',
  imports: [RouterLink, TranslocoPipe, DataPipe, IconaComponent, GestioneSegnalazioneComponent],
  templateUrl: './scheda-segnalazione-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class SchedaSegnalazioneComponent {
  private readonly manutenzione = inject(ManutenzioneService);
  protected readonly errori = inject(ErroriService);

  /** Id dal percorso. */
  readonly id = input.required({ transform: numberAttribute });

  protected readonly elenco = PERCORSI_STAFF.manutenzione;
  protected readonly gestore = inject(AuthService).haPermessi([PERMESSI.MANUTENZIONE_GESTISCI]);
  protected readonly scheda = rxResource({
    params: () => this.id(),
    stream: ({ params: id }) => this.manutenzione.leggiSegnalazione(id),
  });
}
