import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { campiCambiati } from '../../../core/services/api/campi-cambiati';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { STATI_CAMERA } from '../../../core/services/camere/camere-costanti';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { ManutenzioneService } from '../../../core/services/manutenzione/manutenzione-service';
import {
  LUNGHEZZA_SEGNALAZIONE,
  PRIORITA,
  STATI_SEGNALAZIONE,
} from '../../../core/services/pulizie/pulizie-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { Priorita } from '../../../shared/models/attivita-pulizia/attivita-pulizia-model';
import { StatoCamera } from '../../../shared/models/camera/camera-model';
import {
  SegnalazioneAggiornaPayload,
  SegnalazioneManutenzioneInterface,
  StatoSegnalazione,
} from '../../../shared/models/segnalazione-manutenzione/segnalazione-manutenzione-model';

/**
 * Lavoro di chi gestisce la manutenzione: stato, incaricato, priorità, note di risoluzione
 * e stato della camera. Salva i soli campi cambiati; passando a "in corso" senza
 * incaricato il backend la assegna a chi salva.
 */
@Component({
  selector: 'app-gestione-segnalazione',
  imports: [ReactiveFormsModule, TranslocoPipe, CampoComponent],
  templateUrl: './gestione-segnalazione-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class GestioneSegnalazioneComponent {
  private readonly manutenzione = inject(ManutenzioneService);
  private readonly avvisi = inject(AvvisiService);
  private readonly transloco = inject(TranslocoService);
  protected readonly errori = inject(ErroriService);

  readonly segnalazione = input.required<SegnalazioneManutenzioneInterface>();
  readonly salvata = output<SegnalazioneManutenzioneInterface>();

  protected readonly stati = STATI_SEGNALAZIONE;
  protected readonly priorita = PRIORITA;
  protected readonly statiCamera = STATI_CAMERA;
  protected readonly lunghezza = LUNGHEZZA_SEGNALAZIONE;
  protected readonly incaricabili = rxResource({
    stream: () => this.manutenzione.elencaIncaricabili(),
  });
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    stato: ['aperta' as StatoSegnalazione],
    assegnata_a: [null as number | null],
    priorita: ['normale' as Priorita],
    note_risoluzione: ['', Validators.maxLength(LUNGHEZZA_SEGNALAZIONE.testo)],
    stato_camera: ['attiva' as StatoCamera],
  });

  constructor() {
    effect(() => this.compila(this.segnalazione()));
  }

  /**
   * SALVA
   */
  salva(): void {
    if (this.modulo.invalid) {
      this.modulo.markAllAsTouched();
      return;
    }
    const modifiche: SegnalazioneAggiornaPayload = campiCambiati(this.modulo.controls);
    if (!Object.keys(modifiche).length) return;
    this.inCorso.set(true);
    this.errore.set('');
    this.manutenzione
      .aggiornaSegnalazione(this.segnalazione().id, modifiche)
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: (segnalazione) => {
          this.avvisi.mostra(
            this.transloco.translate('gestionale.manutenzione.salvata'),
            'successo',
          );
          this.salvata.emit(segnalazione);
        },
        error: (motivo: unknown) => this.errore.set(this.errori.messaggio(motivo)),
      });
  }

  private compila(segnalazione: SegnalazioneManutenzioneInterface): void {
    this.modulo.reset({
      stato: segnalazione.stato,
      assegnata_a: segnalazione.assegnata_a,
      priorita: segnalazione.priorita,
      note_risoluzione: segnalazione.note_risoluzione ?? '',
      stato_camera: segnalazione.camera?.stato ?? 'attiva',
    });
  }
}
