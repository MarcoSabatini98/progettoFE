import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { CamereService } from '../../../core/services/camere/camere-service';
import { DisponibilitaService } from '../../../core/services/disponibilita/disponibilita-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { PERCORSI_PUBBLICI } from '../../../core/services/navigazione/navigazione-costanti';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { BloccoCameraInterface } from '../../../shared/models/blocco-camera/blocco-camera-model';
import { FiltriDisponibilita } from '../../../shared/models/disponibilita/disponibilita-model';
import { PreventivoInterface } from '../../../shared/models/preventivo/preventivo-model';
import { SceltaSoggiornoInterface } from '../../../shared/models/scelta-soggiorno/scelta-soggiorno-model';
import { TipologiaCameraInterface } from '../../../shared/models/tipologia-camera/tipologia-camera-model';
import { MediaPipe } from '../../../shared/pipes/media-pipe';
import { PrezzoPipe } from '../../../shared/pipes/prezzo-pipe';
import { ConfermaPrenotazioneComponent } from '../conferma-prenotazione-component/conferma-prenotazione-component';
import { RicercaSoggiornoComponent } from '../ricerca-soggiorno-component/ricerca-soggiorno-component';

/**
 * Prenotazione dal sito (/prenota) o dalla reception (/staff/prenotazioni/nuova):
 * ricerca, scelta della tipologia e conferma. Dalla pagina di una tipologia o di una camera
 * (?tipologia=doppia&camera=103) mostra solo quella e blocca proprio quella camera.
 * Scegliere blocca una camera per qualche minuto; lasciare la pagina la libera.
 */
@Component({
  selector: 'app-prenota',
  imports: [
    RouterLink,
    TranslocoPipe,
    IconaComponent,
    MediaPipe,
    PrezzoPipe,
    RicercaSoggiornoComponent,
    ConfermaPrenotazioneComponent,
  ],
  templateUrl: './prenota-component.html',
  styleUrl: './prenota-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class PrenotaComponent {
  private readonly disponibilita = inject(DisponibilitaService);
  private readonly lingua = inject(LinguaService);
  private readonly camere = inject(CamereService);
  protected readonly errori = inject(ErroriService);

  /** Dai dati della rotta del gestionale. */
  readonly staff = input(false, { transform: booleanAttribute });
  /** Slug e numero dalla query string del sito. */
  readonly tipologia = input<string>();
  readonly camera = input<string>();

  protected readonly percorsoPrenota = PERCORSI_PUBBLICI.prenota;
  private readonly preferita = rxResource({
    params: () => {
      const slug = this.tipologia();
      return slug ? { slug, lingua: this.lingua.attiva() } : undefined;
    },
    stream: ({ params }) => this.camere.leggiTipologiaPubblica(params.slug),
  });
  /** Tipologia scelta sul sito ed eventualmente la sua camera. */
  protected readonly preferenza = computed(() => {
    if (!this.preferita.hasValue()) return undefined;
    const tipologia = this.preferita.value();
    return { tipologia, camera: tipologia.camere?.find((voce) => voce.numero === this.camera()) };
  });

  /** Blocco della sessione: resta anche tornando ai risultati, finché non se ne sceglie un altro. */
  private blocco?: BloccoCameraInterface;

  protected readonly filtri = signal<FiltriDisponibilita | undefined>(undefined);
  protected readonly scelta = signal<SceltaSoggiornoInterface | undefined>(undefined);
  /** Tipologia che si sta bloccando. */
  protected readonly inBlocco = signal<number | undefined>(undefined);
  protected readonly errore = signal('');
  /** La sessione fa contare come libera la camera che questa pagina tiene già bloccata. */
  protected readonly risultati = rxResource({
    params: () => {
      const filtri = this.filtri();
      return filtri && { filtri, lingua: this.lingua.attiva() };
    },
    stream: ({ params }) =>
      this.disponibilita.cerca({ ...params.filtri, sessione: this.blocco?.sessione }),
  });
  protected readonly voci = computed(() => {
    const voci = this.risultati.hasValue() ? this.risultati.value() : [];
    const id = this.preferenza()?.tipologia.id;
    return id ? voci.filter((voce) => voce.tipologia.id === id) : voci;
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.rilascia());
  }

  /**
   * CERCA
   */
  cerca(filtri: FiltriDisponibilita): void {
    this.errore.set('');
    this.filtri.set(filtri);
  }

  /**
   * SCEGLI
   * Blocca la camera scelta sul sito o la prima libera della tipologia, poi passa alla conferma.
   */
  scegli(tipologia: TipologiaCameraInterface, preventivo: PreventivoInterface): void {
    const filtri = this.filtri();
    if (!filtri) {
      return;
    }
    const { arrivo, partenza, adulti, bambini = 0 } = filtri;
    const camera = this.preferenza()?.camera;
    this.inBlocco.set(tipologia.id);
    this.errore.set('');
    this.disponibilita
      .blocca({
        sessione: this.blocco?.sessione,
        ...(camera ? { camera_id: camera.id } : { tipologia_id: tipologia.id }),
        arrivo,
        partenza,
        ospiti: adulti + bambini,
      })
      .pipe(finalize(() => this.inBlocco.set(undefined)))
      .subscribe({
        next: (blocco) => {
          this.blocco = blocco;
          this.scelta.set({ tipologia, preventivo, filtri, blocco });
        },
        error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
      });
  }

  /**
   * CAMBIA CAMERA
   * Torna ai risultati aggiornati; il blocco resta finché non se ne sceglie un altro.
   */
  cambiaCamera(): void {
    this.scelta.set(undefined);
    this.risultati.reload();
  }

  /** Scade comunque da solo: un errore qui non va mostrato. */
  private rilascia(): void {
    if (this.blocco) {
      this.disponibilita.rilascia(this.blocco.sessione).subscribe({ error: () => undefined });
    }
  }
}
