import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AuthService } from '../../../core/services/auth/auth-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import { UtentiService } from '../../../core/services/utenti/utenti-service';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { DataPipe } from '../../../shared/pipes/data-pipe';
import { DatiUtenteComponent } from '../dati-utente-component/dati-utente-component';
import { EliminaComponent } from '../elimina-component/elimina-component';

/**
 * Scheda di un account: dati, accessi ed eliminazione. Il proprio account
 * non si elimina da qui (lo rifiuta anche il backend).
 */
@Component({
  selector: 'app-scheda-utente',
  imports: [
    RouterLink,
    TranslocoPipe,
    DataPipe,
    DatiUtenteComponent,
    EliminaComponent,
    IconaComponent,
  ],
  templateUrl: './scheda-utente-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class SchedaUtenteComponent {
  private readonly utenti = inject(UtentiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly errori = inject(ErroriService);

  /** Id dal percorso. */
  readonly id = input.required({ transform: numberAttribute });

  protected readonly elenco = PERCORSI_STAFF.utenti;
  protected readonly scheda = rxResource({
    params: () => this.id(),
    stream: ({ params: id }) => this.utenti.leggiUtente(id),
  });
  protected readonly proprio = computed(() => this.auth.utente()?.id === this.id());
  protected readonly elimina = () => this.utenti.eliminaUtente(this.id());

  protected tornaAllElenco(): void {
    void this.router.navigateByUrl(this.elenco);
  }
}
