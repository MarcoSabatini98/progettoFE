import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { Observable, finalize } from 'rxjs';

import { CalendariService } from '../../../core/services/calendari/calendari-service';
import { giornoDopo } from '../../../core/services/disponibilita/date-soggiorno';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { CameraInterface } from '../../../shared/models/camera/camera-model';
import { DataBloccataInterface } from '../../../shared/models/data-bloccata/data-bloccata-model';
import { EsitoChiusuraInterface } from '../../../shared/models/esito-chiusura/esito-chiusura-model';
import { DataPipe } from '../../../shared/pipes/data-pipe';

/** Lunghezza massima del motivo (come nel backend). */
const LUNGHEZZA_MOTIVO = 255;

type Conflitti = EsitoChiusuraInterface['prenotazioni_in_conflitto'];

/**
 * Chiude una camera, o tutta la struttura, per un periodo; con una chiusura scelta la
 * modifica o la toglie. Le prenotazioni già presenti restano: si elencano per decidere.
 */
@Component({
  selector: 'app-chiusura',
  imports: [
    DataPipe,
    ReactiveFormsModule,
    RouterLink,
    TranslocoPipe,
    CampoComponent,
    IconaComponent,
  ],
  templateUrl: './chiusura-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class ChiusuraComponent {
  private readonly calendari = inject(CalendariService);
  protected readonly errori = inject(ErroriService);

  readonly camere = input.required<CameraInterface[]>();
  /** 'YYYY-MM-DD': proposta per una nuova chiusura. */
  readonly giorno = input.required<string>();
  /** Chiusura da modificare; null = nuova. */
  readonly chiusura = input<DataBloccataInterface | null>(null);
  readonly cambiata = output();
  readonly annulla = output();

  protected readonly lunghezza = LUNGHEZZA_MOTIVO;
  protected readonly scheda = PERCORSI_STAFF.prenotazioni;
  protected readonly giornoDopo = giornoDopo;
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');
  protected readonly conflitti = signal<Conflitti>([]);
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    camera_id: [null as number | null],
    data_inizio: ['', Validators.required],
    data_fine: ['', Validators.required],
    motivo: ['', Validators.maxLength(LUNGHEZZA_MOTIVO)],
  });

  constructor() {
    // La camera di una chiusura non si cambia: si toglie e se ne fa un'altra.
    effect(() => {
      const scelta = this.chiusura();
      this.errore.set('');
      this.modulo.reset({
        camera_id: scelta?.camera_id ?? null,
        data_inizio: scelta?.data_inizio ?? this.giorno(),
        data_fine: scelta?.data_fine ?? giornoDopo(this.giorno()),
        motivo: scelta?.motivo ?? '',
      });
      if (scelta) {
        this.modulo.controls.camera_id.disable();
      } else {
        this.modulo.controls.camera_id.enable();
      }
    });
  }

  /**
   * SALVA
   * Nuova: blocca e mostra le prenotazioni in conflitto. Scelta: aggiorna date e motivo.
   */
  salva(): void {
    if (this.modulo.invalid) {
      this.modulo.markAllAsTouched();
      return;
    }
    const { camera_id, motivo, ...date } = this.modulo.getRawValue();
    const scelta = this.chiusura();
    const dati = { ...date, motivo: motivo || null };
    if (scelta) {
      this.esegui(this.calendari.aggiornaChiusura(scelta.id, dati), () => this.conflitti.set([]));
    } else {
      this.esegui(this.calendari.blocca({ ...dati, camera_id }), (esito) =>
        this.conflitti.set(esito.prenotazioni_in_conflitto),
      );
    }
  }

  /**
   * RIAPRI
   */
  riapri(id: number): void {
    this.esegui(this.calendari.sblocca(id), () => this.conflitti.set([]));
  }

  private esegui<T>(richiesta: Observable<T>, dopo: (esito: T) => void): void {
    this.inCorso.set(true);
    this.errore.set('');
    richiesta.pipe(finalize(() => this.inCorso.set(false))).subscribe({
      next: (esito) => {
        dopo(esito);
        this.cambiata.emit();
      },
      error: (motivo: unknown) => this.errore.set(this.errori.messaggio(motivo)),
    });
  }
}
