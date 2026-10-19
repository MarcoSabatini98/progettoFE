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
import { LIMITI_CAMERE, LUNGHEZZA_TIPOLOGIA } from '../../../core/services/camere/camere-costanti';
import { CamereService } from '../../../core/services/camere/camere-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import {
  TipologiaAggiornaPayload,
  TipologiaCameraInterface,
} from '../../../shared/models/tipologia-camera/tipologia-camera-model';
import { SceltaDotazioniComponent } from '../scelta-dotazioni-component/scelta-dotazioni-component';

/** Dati di una tipologia venduta sul sito: prezzo, ospiti, testi e dotazioni. Salva i soli campi cambiati. */
@Component({
  selector: 'app-dati-tipologia',
  imports: [ReactiveFormsModule, TranslocoPipe, CampoComponent, SceltaDotazioniComponent],
  templateUrl: './dati-tipologia-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class DatiTipologiaComponent {
  private readonly camere = inject(CamereService);
  private readonly avvisi = inject(AvvisiService);
  private readonly transloco = inject(TranslocoService);
  protected readonly errori = inject(ErroriService);

  readonly tipologia = input.required<TipologiaCameraInterface>();
  readonly salvata = output<TipologiaCameraInterface>();

  protected readonly lunghezza = LUNGHEZZA_TIPOLOGIA;
  protected readonly limiti = LIMITI_CAMERE;
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    nome: ['', [Validators.required, Validators.maxLength(LUNGHEZZA_TIPOLOGIA.nome)]],
    prezzo_base: [0, [Validators.required, Validators.min(0)]],
    ospiti_max: [
      1,
      [Validators.required, Validators.min(1), Validators.max(LIMITI_CAMERE.ospitiMax)],
    ],
    superficie_mq: [
      null as number | null,
      [Validators.min(1), Validators.max(LIMITI_CAMERE.superficieMax)],
    ],
    letti: ['', Validators.maxLength(LUNGHEZZA_TIPOLOGIA.letti)],
    descrizione: ['', Validators.maxLength(LUNGHEZZA_TIPOLOGIA.descrizione)],
    ordine: [0, [Validators.min(0), Validators.max(LIMITI_CAMERE.ordineMax)]],
    attiva: [true],
    servizi: [[] as number[]],
  });

  constructor() {
    effect(() => this.compila(this.tipologia()));
  }

  /**
   * SALVA
   */
  salva(): void {
    if (this.modulo.invalid) {
      this.modulo.markAllAsTouched();
      return;
    }
    const modifiche: TipologiaAggiornaPayload = campiCambiati(this.modulo.controls);
    if (!Object.keys(modifiche).length) return;
    this.inCorso.set(true);
    this.errore.set('');
    this.camere
      .aggiornaTipologia(this.tipologia().id, modifiche)
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: (tipologia) => {
          this.avvisi.mostra(this.transloco.translate('gestionale.camere.salvata'), 'successo');
          this.salvata.emit(tipologia);
        },
        error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
      });
  }

  // I DECIMAL arrivano come testo; i testi assenti diventano vuoti.
  private compila(tipologia: TipologiaCameraInterface): void {
    this.modulo.reset({
      nome: tipologia.nome,
      prezzo_base: Number(tipologia.prezzo_base),
      ospiti_max: tipologia.ospiti_max,
      superficie_mq: tipologia.superficie_mq,
      letti: tipologia.letti ?? '',
      descrizione: tipologia.descrizione ?? '',
      ordine: tipologia.ordine,
      attiva: tipologia.attiva,
      servizi: (tipologia.servizi ?? []).map((servizio) => servizio.id),
    });
  }
}
