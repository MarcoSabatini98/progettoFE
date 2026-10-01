import { ChangeDetectionStrategy, Component, inject, linkedSignal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { debounceTime } from 'rxjs';

import { AuthService } from '../../../core/services/auth/auth-service';
import { ATTESA_RICERCA_MS } from '../../../core/services/api/api-costanti';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import {
  CANALI,
  STATI_PRENOTAZIONE,
} from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { PrenotazioniService } from '../../../core/services/prenotazioni/prenotazioni-service';
import { PERMESSI } from '../../../core/services/ruoli/ruoli-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { PaginazioneComponent } from '../../../shared/paginazione-component/paginazione-component';
import {
  Canale,
  FiltriPrenotazioni,
  StatoPrenotazione,
} from '../../../shared/models/prenotazione/prenotazione-model';
import { RigaPrenotazioneComponent } from '../riga-prenotazione-component/riga-prenotazione-component';

const PRENOTAZIONI_PER_PAGINA = 20;

/** Tutte le prenotazioni, filtrate per testo, stato, canale e periodo di arrivo. */
@Component({
  selector: 'app-prenotazioni',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslocoPipe,
    CampoComponent,
    IconaComponent,
    PaginazioneComponent,
    RigaPrenotazioneComponent,
  ],
  templateUrl: './prenotazioni-component.html',
  styleUrl: './prenotazioni-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class PrenotazioniComponent {
  private readonly prenotazioni = inject(PrenotazioniService);
  protected readonly errori = inject(ErroriService);

  protected readonly stati = STATI_PRENOTAZIONE;
  protected readonly canali = CANALI;
  protected readonly nuova = PERCORSI_STAFF.nuovaPrenotazione;
  protected readonly puoPrenotare = inject(AuthService).haPermessi([
    PERMESSI.PRENOTAZIONI_GESTISCI,
  ]);
  protected readonly filtri = inject(NonNullableFormBuilder).group({
    cerca: '',
    stato: '' as StatoPrenotazione | '',
    canale: '' as Canale | '',
    dal: '',
    al: '',
    ordine: 'desc' as NonNullable<FiltriPrenotazioni['ordine']>,
  });
  private readonly scelti = toSignal(
    this.filtri.valueChanges.pipe(debounceTime(ATTESA_RICERCA_MS)),
    { initialValue: this.filtri.getRawValue() },
  );
  /** Cambiando filtri si riparte dalla prima pagina. */
  protected readonly pagina = linkedSignal({ source: this.scelti, computation: () => 1 });
  protected readonly elenco = rxResource({
    params: () => this.parametri(),
    stream: ({ params }) => this.prenotazioni.elencaPrenotazioni(params),
  });

  /**
   * SFOGLIA
   * Avanti o indietro di una pagina.
   */
  sfoglia(passo: number): void {
    this.pagina.update((numero) => numero + passo);
  }

  // I campi vuoti non arrivano all'API (creaParametri).
  private parametri(): FiltriPrenotazioni {
    const { stato, canale, ...resto } = this.scelti();
    return {
      ...resto,
      stato: stato ? [stato] : [],
      canale: canale || undefined,
      pagina: this.pagina(),
      perPagina: PRENOTAZIONI_PER_PAGINA,
    };
  }
}
