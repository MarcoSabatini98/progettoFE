import { ChangeDetectionStrategy, Component, inject, input, numberAttribute } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AuthService } from '../../../core/services/auth/auth-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import { minutiPulizia } from '../../../core/services/pulizie/passaggi-pulizia';
import { PulizieService } from '../../../core/services/pulizie/pulizie-service';
import { PERMESSI } from '../../../core/services/ruoli/ruoli-costanti';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { DataPipe } from '../../../shared/pipes/data-pipe';
import { DatiPuliziaComponent } from '../dati-pulizia-component/dati-pulizia-component';
import { EliminaComponent } from '../elimina-component/elimina-component';
import { LavoroPuliziaComponent } from '../lavoro-pulizia-component/lavoro-pulizia-component';

/**
 * Scheda di un'attività di pulizia (anche dai link delle notifiche): il lavoro dell'addetto
 * e, per chi gestisce, pianificazione ed eliminazione finché non è iniziata.
 */
@Component({
  selector: 'app-scheda-pulizia',
  imports: [
    RouterLink,
    TranslocoPipe,
    DataPipe,
    IconaComponent,
    DatiPuliziaComponent,
    EliminaComponent,
    LavoroPuliziaComponent,
  ],
  templateUrl: './scheda-pulizia-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class SchedaPuliziaComponent {
  private readonly pulizie = inject(PulizieService);
  private readonly router = inject(Router);
  protected readonly errori = inject(ErroriService);

  /** Id dal percorso. */
  readonly id = input.required({ transform: numberAttribute });

  protected readonly elenco = PERCORSI_STAFF.pulizie;
  protected readonly gestore = inject(AuthService).haPermessi([PERMESSI.PULIZIE_GESTISCI]);
  /** Quanto è durata la pulizia, a chi gestisce. */
  protected readonly minuti = minutiPulizia;
  protected readonly scheda = rxResource({
    params: () => this.id(),
    stream: ({ params: id }) => this.pulizie.leggiAttivita(id),
  });
  /** Solo finché è da fare: poi il backend la rifiuta. */
  protected readonly elimina = () => this.pulizie.eliminaAttivita(this.id());

  protected tornaAllElenco(): void {
    void this.router.navigateByUrl(this.elenco);
  }
}
