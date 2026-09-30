import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { DisponibilitaService } from '../../../core/services/disponibilita/disponibilita-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
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
 * Prenotazione dal sito (/prenota): ricerca, scelta della tipologia e conferma.
 * Scegliere blocca una camera per qualche minuto; lasciare la pagina la libera.
 */
@Component({
  selector: 'app-prenota',
  imports: [
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
  protected readonly errori = inject(ErroriService);

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
   * Blocca la prima camera libera della tipologia, poi passa alla conferma.
   */
  scegli(tipologia: TipologiaCameraInterface, preventivo: PreventivoInterface): void {
    const filtri = this.filtri();
    if (!filtri) {
      return;
    }
    const { arrivo, partenza, adulti, bambini = 0 } = filtri;
    this.inBlocco.set(tipologia.id);
    this.errore.set('');
    this.disponibilita
      .blocca({
        sessione: this.blocco?.sessione,
        tipologia_id: tipologia.id,
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
