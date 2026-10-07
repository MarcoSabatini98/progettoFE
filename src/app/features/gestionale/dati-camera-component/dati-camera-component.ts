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
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { campiCambiati } from '../../../core/services/api/campi-cambiati';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import {
  LIMITI_CAMERE,
  LUNGHEZZA_CAMERA,
  STATI_CAMERA,
} from '../../../core/services/camere/camere-costanti';
import { CamereService } from '../../../core/services/camere/camere-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import {
  CameraAggiornaPayload,
  CameraInterface,
  StatoCamera,
} from '../../../shared/models/camera/camera-model';
import { TipologiaCameraInterface } from '../../../shared/models/tipologia-camera/tipologia-camera-model';

/**
 * Dati di una camera fisica: numero, tipologia, piano, stato e descrizione per il sito.
 * Le dotazioni sono quelle della tipologia: si scelgono lì.
 * Salva i soli campi cambiati.
 */
@Component({
  selector: 'app-dati-camera',
  imports: [ReactiveFormsModule, TranslocoPipe, CampoComponent],
  templateUrl: './dati-camera-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class DatiCameraComponent {
  private readonly camere = inject(CamereService);
  private readonly avvisi = inject(AvvisiService);
  private readonly transloco = inject(TranslocoService);
  protected readonly errori = inject(ErroriService);

  readonly camera = input.required<CameraInterface>();
  readonly tipologie = input.required<TipologiaCameraInterface[]>();
  readonly salvata = output<CameraInterface>();

  protected readonly stati = STATI_CAMERA;
  protected readonly lunghezza = LUNGHEZZA_CAMERA;
  protected readonly limiti = LIMITI_CAMERE;
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    numero: ['', [Validators.required, Validators.maxLength(LUNGHEZZA_CAMERA.numero)]],
    nome: ['', Validators.maxLength(LUNGHEZZA_CAMERA.nome)],
    tipologia_id: [0, Validators.required],
    piano: [0, [Validators.min(LIMITI_CAMERE.pianoMin), Validators.max(LIMITI_CAMERE.pianoMax)]],
    ospiti_max: [
      null as number | null,
      [Validators.min(1), Validators.max(LIMITI_CAMERE.ospitiMax)],
    ],
    stato: ['attiva' as StatoCamera],
    descrizione: ['', Validators.maxLength(LUNGHEZZA_CAMERA.descrizione)],
    note: ['', Validators.maxLength(LUNGHEZZA_CAMERA.note)],
  });

  constructor() {
    effect(() => this.compila(this.camera()));
  }

  /**
   * SALVA
   */
  salva(): void {
    if (this.modulo.invalid) {
      this.modulo.markAllAsTouched();
      return;
    }
    const modifiche: CameraAggiornaPayload = campiCambiati(this.modulo.controls);
    if (!Object.keys(modifiche).length) return;
    this.inCorso.set(true);
    this.errore.set('');
    this.camere
      .aggiornaCamera(this.camera().id, modifiche)
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: (camera) => {
          this.avvisi.mostra(this.transloco.translate('gestionale.camere.salvata'), 'successo');
          this.salvata.emit(camera);
        },
        error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
      });
  }

  private compila(camera: CameraInterface): void {
    this.modulo.reset({
      numero: camera.numero,
      nome: camera.nome ?? '',
      tipologia_id: camera.tipologia_id,
      piano: camera.piano,
      ospiti_max: camera.ospiti_max,
      stato: camera.stato,
      descrizione: camera.descrizione ?? '',
      note: camera.note ?? '',
    });
  }
}
