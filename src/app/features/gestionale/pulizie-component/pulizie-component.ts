import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { Observable, finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth/auth-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { dataCalendario } from '../../../core/services/disponibilita/date-soggiorno';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import { STATI_ATTIVITA_PULIZIA } from '../../../core/services/pulizie/pulizie-costanti';
import { PulizieService } from '../../../core/services/pulizie/pulizie-service';
import { PERMESSI } from '../../../core/services/ruoli/ruoli-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { NuovaPuliziaComponent } from '../nuova-pulizia-component/nuova-pulizia-component';
import { RigaPuliziaComponent } from '../riga-pulizia-component/riga-pulizia-component';

/**
 * Giornata delle pulizie, pensata per il telefono: le attività del giorno divise per stato.
 * Chi gestisce genera la giornata, assegna gli addetti e aggiunge attività.
 */
@Component({
  selector: 'app-pulizie',
  imports: [
    RouterLink,
    TranslocoPipe,
    CampoComponent,
    IconaComponent,
    NuovaPuliziaComponent,
    RigaPuliziaComponent,
  ],
  templateUrl: './pulizie-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class PulizieComponent {
  private readonly pulizie = inject(PulizieService);
  private readonly avvisi = inject(AvvisiService);
  private readonly transloco = inject(TranslocoService);
  private readonly auth = inject(AuthService);
  protected readonly errori = inject(ErroriService);

  protected readonly stati = STATI_ATTIVITA_PULIZIA;
  protected readonly checklist = PERCORSI_STAFF.checklistPulizie;
  protected readonly gestore = this.auth.haPermessi([PERMESSI.PULIZIE_GESTISCI]);
  protected readonly addetto = this.auth.haPermessi([PERMESSI.PULIZIE_ESEGUI]);
  protected readonly giorno = signal(dataCalendario(new Date()));
  protected readonly mie = signal(false);
  protected readonly inCorso = signal(false);
  protected readonly attivita = rxResource({
    params: () => ({ data: this.giorno(), mie: this.mie() || undefined }),
    stream: ({ params }) => this.pulizie.elencaAttivita(params),
  });
  protected readonly perStato = computed(() => {
    const elenco = this.attivita.value() ?? [];
    return this.stati.map((stato) => ({
      stato,
      attivita: elenco.filter((riga) => riga.stato === stato),
    }));
  });

  /**
   * CAMBIA GIORNO
   * Un campo data svuotato torna a oggi.
   */
  cambiaGiorno(valore: string): void {
    this.giorno.set(valore || dataCalendario(new Date()));
  }

  /**
   * GENERA GIORNATA
   * Riassetti delle camere occupate e checklist mancanti.
   */
  generaGiornata(): void {
    this.esegui(this.pulizie.generaGiornata(this.giorno()), 'gestionale.pulizie.generata');
  }

  /**
   * ASSEGNA
   * Le attività libere agli addetti in servizio.
   */
  assegna(): void {
    this.esegui(this.pulizie.assegnaGiornata(this.giorno()), 'gestionale.pulizie.assegnate');
  }

  /** Avvisa con i numeri dell'esito e ricarica la giornata. */
  private esegui(richiesta: Observable<object>, chiave: string): void {
    this.inCorso.set(true);
    richiesta.pipe(finalize(() => this.inCorso.set(false))).subscribe({
      next: (esito) => {
        this.avvisi.mostra(this.transloco.translate(chiave, esito), 'successo');
        this.attivita.reload();
      },
      error: (motivo: unknown) => this.avvisi.mostra(this.errori.messaggio(motivo), 'errore'),
    });
  }
}
