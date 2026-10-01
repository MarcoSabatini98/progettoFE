import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { Observable, finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth/auth-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { CODICE_SALDO_APERTO } from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { PrenotazioniService } from '../../../core/services/prenotazioni/prenotazioni-service';
import { PERMESSI } from '../../../core/services/ruoli/ruoli-costanti';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { CodicePermesso } from '../../../shared/models/permesso/permesso-model';
import {
  PrenotazioneInterface,
  StatoPrenotazione,
} from '../../../shared/models/prenotazione/prenotazione-model';

type Azione = 'conferma' | 'checkIn' | 'noShow' | 'checkOut';

/** Da quale stato parte ogni azione e chi può farla (prenotazioni.routes.js). */
const AZIONI: Record<
  Azione,
  { stato: StatoPrenotazione; permesso: CodicePermesso; icona: string }
> = {
  conferma: { stato: 'in_attesa', permesso: PERMESSI.PRENOTAZIONI_GESTISCI, icona: 'check' },
  checkIn: { stato: 'confermata', permesso: PERMESSI.CHECKIN_GESTISCI, icona: 'login' },
  noShow: { stato: 'confermata', permesso: PERMESSI.PRENOTAZIONI_GESTISCI, icona: 'person_off' },
  checkOut: { stato: 'in_soggiorno', permesso: PERMESSI.CHECKIN_GESTISCI, icona: 'logout' },
};

/** Azioni che chiedono un secondo tocco prima di partire. */
const DA_CONFERMARE: readonly Azione[] = ['noShow'];

/**
 * Passi della prenotazione possibili nel suo stato: conferma, arrivo, mancato arrivo, partenza.
 * Il check-out con un saldo aperto si può ripetere forzandolo.
 */
@Component({
  selector: 'app-azioni-prenotazione',
  imports: [TranslocoPipe, IconaComponent],
  templateUrl: './azioni-prenotazione-component.html',
  styleUrl: './azioni-prenotazione-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AzioniPrenotazioneComponent {
  private readonly auth = inject(AuthService);
  private readonly prenotazioni = inject(PrenotazioniService);
  private readonly errori = inject(ErroriService);

  readonly prenotazione = input.required<PrenotazioneInterface>();
  /** Stato cambiato: chi la mostra ricarica. */
  readonly aggiornata = output();

  protected readonly icone = Object.fromEntries(
    Object.entries(AZIONI).map(([azione, { icona }]) => [azione, icona]),
  );
  protected readonly disponibili = computed(() =>
    (Object.keys(AZIONI) as Azione[]).filter(
      (azione) =>
        AZIONI[azione].stato === this.prenotazione().stato &&
        this.auth.haPermessi([AZIONI[azione].permesso]),
    ),
  );
  /** Azione in attesa del secondo tocco. */
  protected readonly daConfermare = signal<Azione | undefined>(undefined);
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');

  /**
   * ESEGUI
   * Al secondo tocco un check-out rifiutato per saldo aperto parte forzato.
   */
  esegui(azione: Azione): void {
    const confermata = this.daConfermare() === azione;
    if (DA_CONFERMARE.includes(azione) && !confermata) {
      this.daConfermare.set(azione);
      return;
    }
    this.inCorso.set(true);
    this.errore.set('');
    this.richiesta(azione, confermata)
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: () => {
          this.daConfermare.set(undefined);
          this.aggiornata.emit();
        },
        error: (errore: unknown) => {
          this.errore.set(this.errori.messaggio(errore));
          const saldoAperto = this.errori.codice(errore) === CODICE_SALDO_APERTO;
          this.daConfermare.set(saldoAperto ? 'checkOut' : undefined);
        },
      });
  }

  private richiesta(azione: Azione, forza: boolean): Observable<PrenotazioneInterface> {
    const id = this.prenotazione().id;
    const richieste: Record<Azione, () => Observable<PrenotazioneInterface>> = {
      conferma: () => this.prenotazioni.confermaPrenotazione(id),
      checkIn: () => this.prenotazioni.checkIn(id),
      noShow: () => this.prenotazioni.segnaNoShow(id),
      checkOut: () => this.prenotazioni.checkOut(id, forza),
    };
    return richieste[azione]();
  }
}
