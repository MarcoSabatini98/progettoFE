import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import { UtenteInterface } from '../../../shared/models/utente/utente-model';
import { InizialiPipe } from '../../../shared/pipes/iniziali-pipe';

/**
 * Account in un elenco: iniziali, nome, email, ruolo ed eventuale disattivazione,
 * col collegamento alla sua scheda. Stessa riga delle pulizie.
 */
@Component({
  selector: 'app-riga-utente',
  imports: [RouterLink, TranslocoPipe, InizialiPipe],
  templateUrl: './riga-utente-component.html',
  styleUrl: '../riga-pulizia-component/riga-pulizia-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class RigaUtenteComponent {
  readonly utente = input.required<UtenteInterface>();

  protected readonly scheda = PERCORSI_STAFF.utenti;
}
