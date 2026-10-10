import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { debounceTime, map } from 'rxjs';

import { ATTESA_RICERCA_MS } from '../../../core/services/api/api-costanti';
import { statoPagine } from '../../../core/services/api/stato-pagine';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { RUOLI } from '../../../core/services/ruoli/ruoli-costanti';
import { UtentiService } from '../../../core/services/utenti/utenti-service';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { CodiceRuolo } from '../../../shared/models/ruolo/ruolo-model';
import { FiltriUtenti } from '../../../shared/models/utente/utente-model';
import { PaginazioneComponent } from '../../../shared/paginazione-component/paginazione-component';
import { NuovoStaffComponent } from '../nuovo-staff-component/nuovo-staff-component';
import { RigaUtenteComponent } from '../riga-utente-component/riga-utente-component';

/**
 * Account dello staff e dei clienti in ordine di cognome, cercati per nome o email
 * e filtrati per ruolo e stato. Lo staff nuovo si crea da qui.
 */
@Component({
  selector: 'app-utenti',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    CampoComponent,
    NuovoStaffComponent,
    PaginazioneComponent,
    RigaUtenteComponent,
  ],
  templateUrl: './utenti-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class UtentiComponent {
  private readonly utenti = inject(UtentiService);
  protected readonly errori = inject(ErroriService);

  protected readonly ruoli = Object.values(RUOLI);
  protected readonly filtri = inject(NonNullableFormBuilder).group({
    cerca: '',
    ruolo: '' as CodiceRuolo | '',
    /** '' = tutti; select e query string parlano in testo. */
    attivo: '' as '' | 'true' | 'false',
  });
  private readonly scelti = toSignal(
    this.filtri.valueChanges.pipe(
      debounceTime(ATTESA_RICERCA_MS),
      map(() => this.filtri.getRawValue()),
    ),
    { initialValue: this.filtri.getRawValue() },
  );
  /** Cambiando i filtri si riparte dalla prima pagina. */
  protected readonly pagine = statoPagine(this.scelti);
  protected readonly elenco = rxResource({
    params: () => this.parametri(),
    stream: ({ params }) => this.utenti.elencaUtenti(params),
  });

  private parametri(): FiltriUtenti {
    const { cerca, ruolo, attivo } = this.scelti();
    return {
      cerca: cerca.trim() || undefined,
      ruolo: ruolo || undefined,
      attivo: attivo ? attivo === 'true' : undefined,
      pagina: this.pagine.pagina(),
      perPagina: this.pagine.perPagina(),
    };
  }
}
