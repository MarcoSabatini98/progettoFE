import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { STATI_CAMERA } from '../../../core/services/camere/camere-costanti';
import { CamereService } from '../../../core/services/camere/camere-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { ManutenzioneService } from '../../../core/services/manutenzione/manutenzione-service';
import { LUNGHEZZA_SEGNALAZIONE, PRIORITA } from '../../../core/services/pulizie/pulizie-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { Priorita } from '../../../shared/models/attivita-pulizia/attivita-pulizia-model';
import { StatoCamera } from '../../../shared/models/camera/camera-model';
import { SegnalazioneManutenzioneInterface } from '../../../shared/models/segnalazione-manutenzione/segnalazione-manutenzione-model';

/**
 * Segnalazione di un guasto in una camera o in un'area comune. Chi gestisce la manutenzione
 * può già mettere la camera in manutenzione o fuori servizio.
 */
@Component({
  selector: 'app-nuova-segnalazione',
  imports: [ReactiveFormsModule, TranslocoPipe, CampoComponent, IconaComponent],
  templateUrl: './nuova-segnalazione-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class NuovaSegnalazioneComponent {
  private readonly manutenzione = inject(ManutenzioneService);
  private readonly camere = inject(CamereService);
  private readonly avvisi = inject(AvvisiService);
  private readonly transloco = inject(TranslocoService);
  protected readonly errori = inject(ErroriService);

  /** Solo chi gestisce la manutenzione cambia lo stato della camera. */
  readonly gestore = input(false, { transform: booleanAttribute });
  readonly creata = output<SegnalazioneManutenzioneInterface>();

  protected readonly priorita = PRIORITA;
  protected readonly statiCamera = STATI_CAMERA;
  protected readonly lunghezza = LUNGHEZZA_SEGNALAZIONE;
  protected readonly elencoCamere = rxResource({ stream: () => this.camere.elencaCamere() });
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    camera_id: [null as number | null],
    titolo: ['', [Validators.required, Validators.maxLength(LUNGHEZZA_SEGNALAZIONE.titolo)]],
    descrizione: ['', Validators.maxLength(LUNGHEZZA_SEGNALAZIONE.testo)],
    priorita: ['normale' as Priorita],
    /** '' = la camera resta com'è. */
    stato_camera: ['' as StatoCamera | ''],
  });

  /**
   * SEGNALA
   */
  segnala(): void {
    if (this.modulo.invalid) {
      this.modulo.markAllAsTouched();
      return;
    }
    const { descrizione, stato_camera, ...resto } = this.modulo.getRawValue();
    this.inCorso.set(true);
    this.errore.set('');
    this.manutenzione
      .segnala({
        ...resto,
        descrizione: descrizione || null,
        stato_camera: (resto.camera_id && stato_camera) || undefined,
      })
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: (segnalazione) => {
          this.modulo.reset();
          this.avvisi.mostra(
            this.transloco.translate('gestionale.manutenzione.inviata'),
            'successo',
          );
          this.creata.emit(segnalazione);
        },
        error: (motivo: unknown) => this.errore.set(this.errori.messaggio(motivo)),
      });
  }
}
