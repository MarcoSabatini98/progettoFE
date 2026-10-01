import { ChangeDetectionStrategy, Component, WritableSignal, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { Observable, finalize } from 'rxjs';

import {
  LIMITI_CAMERE,
  LUNGHEZZA_CAMERA,
  LUNGHEZZA_TIPOLOGIA,
} from '../../../core/services/camere/camere-costanti';
import { CamereService } from '../../../core/services/camere/camere-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { MediaPipe } from '../../../shared/pipes/media-pipe';
import { PrezzoPipe } from '../../../shared/pipes/prezzo-pipe';

/**
 * Struttura per lo staff: le tipologie vendute sul sito e le camere fisiche,
 * con la creazione di nuove. Il resto si completa nelle loro schede.
 */
@Component({
  selector: 'app-elenco-camere',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslocoPipe,
    CampoComponent,
    IconaComponent,
    MediaPipe,
    PrezzoPipe,
  ],
  templateUrl: './elenco-camere-component.html',
  styleUrl: './elenco-camere-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class ElencoCamereComponent {
  private readonly camere = inject(CamereService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly errori = inject(ErroriService);

  protected readonly percorsi = PERCORSI_STAFF;
  protected readonly lunghezzaTipologia = LUNGHEZZA_TIPOLOGIA;
  protected readonly lunghezzaCamera = LUNGHEZZA_CAMERA;
  protected readonly limiti = LIMITI_CAMERE;
  protected readonly tipologie = rxResource({ stream: () => this.camere.elencaTipologie() });
  protected readonly elencoCamere = rxResource({ stream: () => this.camere.elencaCamere() });
  protected readonly nuovaTipologia = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(LUNGHEZZA_TIPOLOGIA.nome)]],
    prezzo_base: [0, [Validators.required, Validators.min(0)]],
    ospiti_max: [
      2,
      [Validators.required, Validators.min(1), Validators.max(LIMITI_CAMERE.ospitiMax)],
    ],
  });
  protected readonly nuovaCamera = this.fb.group({
    numero: ['', [Validators.required, Validators.maxLength(LUNGHEZZA_CAMERA.numero)]],
    tipologia_id: [null as number | null, Validators.required],
  });
  protected readonly inCorso = signal(false);
  protected readonly erroreTipologia = signal('');
  protected readonly erroreCamera = signal('');

  /**
   * CREA TIPOLOGIA
   * Basta nome, prezzo e ospiti: foto, testi e dotazioni nella sua scheda.
   */
  creaTipologia(): void {
    if (this.nuovaTipologia.invalid) {
      this.nuovaTipologia.markAllAsTouched();
      return;
    }
    const richiesta = this.camere.creaTipologia(this.nuovaTipologia.getRawValue());
    this.invia(richiesta, PERCORSI_STAFF.tipologie, this.erroreTipologia);
  }

  /**
   * CREA CAMERA
   * Numero e tipologia: piano, stato e note nella sua scheda.
   */
  creaCamera(): void {
    const { numero, tipologia_id } = this.nuovaCamera.getRawValue();
    if (this.nuovaCamera.invalid || tipologia_id === null) {
      this.nuovaCamera.markAllAsTouched();
      return;
    }
    const richiesta = this.camere.creaCamera({ numero, tipologia_id });
    this.invia(richiesta, PERCORSI_STAFF.camere, this.erroreCamera);
  }

  /** Crea e apre la scheda del nuovo elemento. */
  private invia(
    richiesta: Observable<{ id: number }>,
    scheda: string,
    errore: WritableSignal<string>,
  ): void {
    this.inCorso.set(true);
    errore.set('');
    richiesta.pipe(finalize(() => this.inCorso.set(false))).subscribe({
      next: (creato) => void this.router.navigate([scheda, creato.id]),
      error: (motivo: unknown) => errore.set(this.errori.messaggio(motivo)),
    });
  }
}
