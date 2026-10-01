import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AuthService } from '../../../core/services/auth/auth-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { NOMI_LINGUE } from '../../../core/services/lingua/lingua-costanti';
import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import {
  LUNGHEZZA_ORA,
  STATI_ATTIVI,
  STATI_MODIFICABILI_CLIENTE,
} from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { PrenotazioniService } from '../../../core/services/prenotazioni/prenotazioni-service';
import { PERMESSI } from '../../../core/services/ruoli/ruoli-costanti';
import { CancellaPrenotazioneComponent } from '../../../shared/cancella-prenotazione-component/cancella-prenotazione-component';
import { ContoPrenotazioneComponent } from '../../../shared/conto-prenotazione-component/conto-prenotazione-component';
import { DettagliPrenotazioneComponent } from '../../../shared/dettagli-prenotazione-component/dettagli-prenotazione-component';
import { ExtraPrenotazioneComponent } from '../../../shared/extra-prenotazione-component/extra-prenotazione-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { StatoPrenotazione } from '../../../shared/models/prenotazione/prenotazione-model';
import { DataPipe } from '../../../shared/pipes/data-pipe';
import { PrezzoPipe } from '../../../shared/pipes/prezzo-pipe';
import { AzioniPrenotazioneComponent } from '../azioni-prenotazione-component/azioni-prenotazione-component';
import { IncassiPrenotazioneComponent } from '../incassi-prenotazione-component/incassi-prenotazione-component';
import { LinkCheckinComponent } from '../link-checkin-component/link-checkin-component';
import { ModificaPrenotazioneComponent } from '../modifica-prenotazione-component/modifica-prenotazione-component';
import { OspitiSoggiornoComponent } from '../ospiti-soggiorno-component/ospiti-soggiorno-component';

const STATI_IN_CORSO: readonly StatoPrenotazione[] = STATI_ATTIVI;
/** Prima dell'arrivo: si cancella e si manda il link del check-in online. */
const STATI_PRIMA_ARRIVO: readonly StatoPrenotazione[] = STATI_MODIFICABILI_CLIENTE;

/**
 * Prenotazione vista dallo staff: passi di stato, dati di gestione, modifiche, extra,
 * ospiti, incassi, link del check-in online e cancellazione, ognuno secondo i permessi.
 */
@Component({
  selector: 'app-scheda-prenotazione',
  imports: [
    RouterLink,
    TranslocoPipe,
    DataPipe,
    PrezzoPipe,
    AzioniPrenotazioneComponent,
    CancellaPrenotazioneComponent,
    ContoPrenotazioneComponent,
    DettagliPrenotazioneComponent,
    ExtraPrenotazioneComponent,
    IconaComponent,
    IncassiPrenotazioneComponent,
    LinkCheckinComponent,
    ModificaPrenotazioneComponent,
    OspitiSoggiornoComponent,
  ],
  templateUrl: './scheda-prenotazione-component.html',
  styleUrl: './scheda-prenotazione-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class SchedaPrenotazioneComponent {
  private readonly auth = inject(AuthService);
  private readonly prenotazioni = inject(PrenotazioniService);
  protected readonly errori = inject(ErroriService);

  /** Id dal percorso. */
  readonly id = input.required({ transform: numberAttribute });

  protected readonly elenco = PERCORSI_STAFF.prenotazioni;
  protected readonly nomiLingue = NOMI_LINGUE;
  protected readonly lunghezzaOra = LUNGHEZZA_ORA;
  protected readonly puo = {
    gestire: this.auth.haPermessi([PERMESSI.PRENOTAZIONI_GESTISCI]),
    checkIn: this.auth.haPermessi([PERMESSI.CHECKIN_GESTISCI]),
    incassi: this.auth.haPermessi([PERMESSI.PAGAMENTI_LEGGI]),
    ospiti: this.auth.haPermessi([PERMESSI.OSPITI_GESTISCI]),
  };
  protected readonly prenotazione = rxResource({
    params: () => this.id(),
    stream: ({ params: id }) => this.prenotazioni.leggiPrenotazione(id),
  });
  private readonly stato = computed(() =>
    this.prenotazione.hasValue() ? this.prenotazione.value().stato : undefined,
  );
  protected readonly inCorso = computed(() => this.statoTra(STATI_IN_CORSO));
  protected readonly primaArrivo = computed(() => this.statoTra(STATI_PRIMA_ARRIVO));

  private statoTra(stati: readonly StatoPrenotazione[]): boolean {
    const stato = this.stato();
    return !!stato && stati.includes(stato);
  }
}
