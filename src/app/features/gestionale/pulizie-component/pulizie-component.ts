import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { Observable, finalize, map } from 'rxjs';

import { AuthService } from '../../../core/services/auth/auth-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { dataCalendario } from '../../../core/services/disponibilita/date-soggiorno';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { CHIAVI_IMPOSTAZIONI } from '../../../core/services/impostazioni/impostazioni-costanti';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import {
  passaggiPulizia,
  permessiPulizia,
  puoLavorare,
} from '../../../core/services/pulizie/passaggi-pulizia';
import {
  STATI_ATTIVITA_PULIZIA,
  STATI_PULIZIA_APERTA,
} from '../../../core/services/pulizie/pulizie-costanti';
import { PulizieService } from '../../../core/services/pulizie/pulizie-service';
import { PERMESSI } from '../../../core/services/ruoli/ruoli-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import {
  AttivitaPuliziaInterface,
  StatoAttivitaPulizia,
} from '../../../shared/models/attivita-pulizia/attivita-pulizia-model';
import {
  ColonnaPulizieInterface,
  SpostamentoPuliziaInterface,
} from '../../../shared/models/colonna-pulizie/colonna-pulizie-model';
import { AddettoInterface } from '../../../shared/models/utente/utente-model';
import { NuovaPuliziaComponent } from '../nuova-pulizia-component/nuova-pulizia-component';
import { TabellonePulizieComponent } from '../tabellone-pulizie-component/tabellone-pulizie-component';

type Vista = 'stato' | 'addetto';

/** Colonna delle attività senza addetto nella vista per addetto. */
const LIBERE = 'libere';

/**
 * Giornata delle pulizie, pensata per il telefono. Per stato: l'addetto porta le sue
 * attività da fare → in corso → completata, chi gestisce le verifica (se l'ispezione è
 * richiesta). Per addetto: chi gestisce assegna le camere. Si trascina o si sceglie dal menu.
 */
@Component({
  selector: 'app-pulizie',
  imports: [
    RouterLink,
    TranslocoPipe,
    CampoComponent,
    IconaComponent,
    NuovaPuliziaComponent,
    TabellonePulizieComponent,
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
  private readonly impostazioni = inject(ImpostazioniService);
  protected readonly errori = inject(ErroriService);

  protected readonly viste: readonly Vista[] = ['stato', 'addetto'];
  protected readonly checklist = PERCORSI_STAFF.checklistPulizie;
  protected readonly gestore = this.auth.haPermessi([PERMESSI.PULIZIE_GESTISCI]);
  protected readonly addetto = this.auth.haPermessi([PERMESSI.PULIZIE_ESEGUI]);
  protected readonly giorno = signal(dataCalendario(new Date()));
  protected readonly mie = signal(false);
  protected readonly vista = signal<Vista>('stato');
  protected readonly inCorso = signal(false);

  protected readonly attivita = rxResource({
    params: () => ({ data: this.giorno(), mie: this.mie() || undefined }),
    stream: ({ params }) => this.pulizie.elencaAttivita(params),
  });

  /** Solo chi gestisce assegna: agli altri gli addetti non servono. */
  private readonly addetti = rxResource({
    params: () => (this.gestore ? true : undefined),
    stream: () => this.pulizie.elencaAddetti(),
  });

  /** Senza ispezione la colonna Verificate non c'è: la camera completata è già pulita. */
  private readonly ispezione = computed(
    () => this.impostazioni.pubbliche()[CHIAVI_IMPOSTAZIONI.ispezionePulizie] !== false,
  );

  private readonly colonneStato = computed(() => {
    const elenco = this.attivita.value() ?? [];
    return STATI_ATTIVITA_PULIZIA.filter((stato) => stato !== 'verificata' || this.ispezione()).map(
      (stato): ColonnaPulizieInterface => ({
        chiave: stato,
        titolo:
          stato === 'completata' && !this.ispezione()
            ? 'gestionale.pulizie.completate'
            : `gestionale.pulizie.stati.${stato}`,
        attivita: elenco.filter((riga) => riga.stato === stato),
      }),
    );
  });

  private readonly colonneAddetto = computed(() => {
    const elenco = this.attivita.value() ?? [];
    const libere: ColonnaPulizieInterface = {
      chiave: LIBERE,
      titolo: 'gestionale.pulizie.libera',
      attivita: elenco.filter((riga) => !riga.assegnata_a),
    };
    return [
      libere,
      ...this.persone(elenco).map((persona): ColonnaPulizieInterface => ({
        chiave: String(persona.id),
        titolo: 'gestionale.pulizie.addetto',
        parametri: persona,
        attivita: elenco.filter((riga) => riga.assegnata_a === persona.id),
      })),
    ];
  });

  /** Oggi l'addetto senza camere aperte può prendersi la prossima (anche il titolare da solo). */
  protected readonly puoPrendere = computed(() => {
    if (!this.addetto || this.giorno() !== dataCalendario(new Date())) return false;
    const io = this.auth.utente()?.id;
    return !(this.attivita.value() ?? []).some(
      (riga) => riga.assegnata_a === io && STATI_PULIZIA_APERTA.includes(riga.stato),
    );
  });

  /** Stati in cui l'attività può passare, se c'è la colonna. */
  private readonly versoStato = (attivita: AttivitaPuliziaInterface): string[] =>
    puoLavorare(attivita, permessiPulizia(this.auth))
      ? passaggiPulizia(attivita.stato, this.gestore).filter(
          (stato) => stato !== 'verificata' || this.ispezione(),
        )
      : [];

  /** Addetti a cui passarla; una verificata è chiusa. */
  private readonly versoAddetto = (attivita: AttivitaPuliziaInterface): string[] =>
    attivita.stato === 'verificata'
      ? []
      : this.colonneAddetto()
          .map((colonna) => colonna.chiave)
          .filter((chiave) => chiave !== (attivita.assegnata_a?.toString() ?? LIBERE));

  protected readonly tabellone = computed(() =>
    this.vista() === 'stato'
      ? {
          azione: 'gestionale.pulizie.spostaIn',
          colonne: this.colonneStato(),
          destinazioni: this.versoStato,
        }
      : {
          azione: 'gestionale.pulizie.assegnaA',
          colonne: this.colonneAddetto(),
          destinazioni: this.versoAddetto,
        },
  );

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

  /**
   * PROSSIMA CAMERA
   * La più vicina all'ultima finita, o al piano con meno gente.
   */
  prendiProssima(): void {
    const presa = this.pulizie.prossima().pipe(map((attivita) => attivita.camera ?? {}));
    this.esegui(presa, 'gestionale.pulizie.presa');
  }

  /**
   * SPOSTA
   * Per stato fa avanzare l'attività, per addetto la assegna (o la libera).
   */
  sposta({ attivita, verso }: SpostamentoPuliziaInterface): void {
    const richiesta =
      this.vista() === 'stato'
        ? this.pulizie.avanzaAttivita(attivita.id, { stato: verso as StatoAttivitaPulizia })
        : this.pulizie.aggiornaAttivita(attivita.id, {
            assegnata_a: verso === LIBERE ? null : Number(verso),
          });
    richiesta.subscribe({
      // Finita una camera, a turno ne arriva subito un'altra: si ricarica la giornata.
      next: (aggiornata) =>
        aggiornata.stato === 'completata'
          ? this.attivita.reload()
          : this.attivita.value.update((elenco) =>
              elenco?.map((riga) => (riga.id === aggiornata.id ? aggiornata : riga)),
            ),
      error: (motivo: unknown) => this.avvisi.mostra(this.errori.messaggio(motivo), 'errore'),
    });
  }

  /** Addetti in servizio più chi ha già attività del giorno (anche se non è più in servizio). */
  private persone(elenco: AttivitaPuliziaInterface[]): AddettoInterface[] {
    const persone = new Map((this.addetti.value() ?? []).map((persona) => [persona.id, persona]));
    for (const riga of elenco) {
      if (riga.addetto && !persone.has(riga.addetto.id)) {
        persone.set(riga.addetto.id, riga.addetto);
      }
    }
    return [...persone.values()];
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
