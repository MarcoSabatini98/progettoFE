import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDropList,
  CdkDropListGroup,
} from '@angular/cdk/drag-drop';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { finalize, forkJoin } from 'rxjs';

import { AuthService } from '../../../core/services/auth/auth-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { CalendariService } from '../../../core/services/calendari/calendari-service';
import { CamereService } from '../../../core/services/camere/camere-service';
import {
  DURATE_PLANNING,
  DurataPlanning,
  STATI_PLANNING,
  STATI_SPOSTABILI,
  barreChiusure,
  giorniPeriodo,
  periodoPlanning,
  righePlanning,
  spostaSoggiorno,
} from '../../../core/services/camere/planning';
import { dataCalendario, spostaData } from '../../../core/services/disponibilita/date-soggiorno';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import { PrenotazioniService } from '../../../core/services/prenotazioni/prenotazioni-service';
import { PERMESSI } from '../../../core/services/ruoli/ruoli-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import {
  BarraPlanningInterface,
  SpostamentoPlanningInterface,
} from '../../../shared/models/barra-planning/barra-planning-model';
import { CameraInterface } from '../../../shared/models/camera/camera-model';
import { DataBloccataInterface } from '../../../shared/models/data-bloccata/data-bloccata-model';
import { DataPipe } from '../../../shared/pipes/data-pipe';
import { ChiusuraComponent } from '../chiusura-component/chiusura-component';

/** Sul telefono si trascina tenendo premuto: un tocco breve fa scorrere il planning. */
const RITARDO_TRASCINA = { touch: 250, mouse: 0 };

/**
 * Planning delle camere: una riga per camera, una colonna per giorno, i soggiorni e le
 * chiusure come barre. Chi gestisce le prenotazioni trascina un soggiorno su un'altra
 * camera o altri giorni (dopo una conferma: il prezzo si ricalcola); chi gestisce i
 * calendari chiude camere o struttura. Da tastiera si apre la prenotazione e si modifica lì.
 */
@Component({
  selector: 'app-planning',
  imports: [
    CdkDrag,
    CdkDragPlaceholder,
    CdkDropList,
    CdkDropListGroup,
    CdkScrollable,
    DataPipe,
    NgTemplateOutlet,
    RouterLink,
    TranslocoPipe,
    CampoComponent,
    IconaComponent,
    ChiusuraComponent,
  ],
  templateUrl: './planning-component.html',
  styleUrl: './planning-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class PlanningComponent {
  private readonly camere = inject(CamereService);
  private readonly calendari = inject(CalendariService);
  private readonly prenotazioni = inject(PrenotazioniService);
  private readonly avvisi = inject(AvvisiService);
  private readonly transloco = inject(TranslocoService);
  private readonly auth = inject(AuthService);
  protected readonly errori = inject(ErroriService);

  protected readonly durate = DURATE_PLANNING;
  protected readonly statiLegenda = STATI_PLANNING;
  protected readonly ritardo = RITARDO_TRASCINA;
  protected readonly scheda = PERCORSI_STAFF.prenotazioni;
  protected readonly nuova = PERCORSI_STAFF.nuovaPrenotazione;
  protected readonly spostare = this.auth.haPermessi([PERMESSI.PRENOTAZIONI_GESTISCI]);
  protected readonly chiudere = this.auth.haPermessi([PERMESSI.CALENDARI_GESTISCI]);
  protected readonly oggi = dataCalendario(new Date());
  protected readonly dal = signal(this.oggi);
  protected readonly durata = signal<DurataPlanning>(14);
  protected readonly periodo = computed(() => periodoPlanning(this.dal(), this.durata()));
  protected readonly giorni = computed(() => giorniPeriodo(this.periodo()));

  /** Camere con soggiorni e chiusure; le chiusure senza camera valgono per la struttura. */
  protected readonly planning = rxResource({
    params: () => this.periodo(),
    stream: ({ params }) =>
      forkJoin({
        camere: this.camere.leggiPlanning(params),
        chiusure: this.calendari.elencaChiusure(params),
      }),
  });

  protected readonly righe = computed(() =>
    righePlanning(this.planning.value()?.camere ?? [], this.periodo()),
  );
  protected readonly struttura = computed(() =>
    barreChiusure(
      (this.planning.value()?.chiusure ?? []).filter((chiusura) => chiusura.camera_id === null),
      this.periodo(),
    ),
  );
  protected readonly elencoCamere = computed(() => this.righe().map((riga) => riga.camera));

  /** Soggiorno trascinato, in attesa di conferma. */
  protected readonly proposta = signal<SpostamentoPlanningInterface | null>(null);
  /** Chiusura aperta nel modulo; null = nuova. */
  protected readonly chiusuraScelta = signal<DataBloccataInterface | null>(null);
  protected readonly inCorso = signal(false);
  private readonly zonaChiusura = viewChild<ElementRef<HTMLElement>>('zonaChiusura');

  vai(giorni: number): void {
    this.dal.update((dal) => spostaData(dal, giorni));
  }

  cambiaInizio(data: string): void {
    if (data) {
      this.dal.set(data);
    }
  }

  spostabile(barra: BarraPlanningInterface): boolean {
    return this.spostare && STATI_SPOSTABILI.includes(barra.prenotazione?.stato ?? '');
  }

  /** Le chiusure importate dalle OTA si cambiano solo sull'OTA. */
  modificabile(chiusura: DataBloccataInterface): boolean {
    return this.chiudere && chiusura.origine === 'manuale';
  }

  /** Giorni di spostamento dalla distanza percorsa: la barra è larga quanto i suoi giorni. */
  lascia(evento: CdkDragDrop<CameraInterface, CameraInterface, BarraPlanningInterface>): void {
    const { prenotazione, da, a } = evento.item.data;
    const larghezzaGiorno = evento.item.element.nativeElement.offsetWidth / (a - da);
    const giorni = Math.round(evento.distance.x / larghezzaGiorno) || 0;
    const camera = evento.container.data;
    if (!prenotazione || (giorni === 0 && camera.id === evento.previousContainer.data.id)) {
      return;
    }
    this.proposta.set({ prenotazione, camera, ...spostaSoggiorno(prenotazione, giorni) });
  }

  /** Salva lo spostamento: il backend ricontrolla la disponibilità e ricalcola il prezzo. */
  conferma({
    prenotazione,
    camera,
    data_arrivo,
    data_partenza,
  }: SpostamentoPlanningInterface): void {
    this.inCorso.set(true);
    this.prenotazioni
      .aggiornaPrenotazione(prenotazione.id, { camera_id: camera.id, data_arrivo, data_partenza })
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: () => {
          this.proposta.set(null);
          this.avvisi.mostra(
            this.transloco.translate('gestionale.planning.spostata', prenotazione),
            'successo',
          );
          this.planning.reload();
        },
        error: (motivo: unknown) => this.avvisi.mostra(this.errori.messaggio(motivo), 'errore'),
      });
  }

  /** Apre la chiusura nel modulo, che sul telefono sta sotto il planning. */
  scegliChiusura(chiusura: DataBloccataInterface): void {
    this.chiusuraScelta.set(chiusura);
    this.zonaChiusura()?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  chiusuraCambiata(): void {
    this.chiusuraScelta.set(null);
    this.planning.reload();
  }
}
