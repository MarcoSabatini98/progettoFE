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

import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { FattureService } from '../../../core/services/fatture/fatture-service';
import { LUNGHEZZE_FATTURA, STATI_SDI } from '../../../core/services/pagamenti/pagamenti-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { FatturaInterface, StatoSdi } from '../../../shared/models/fattura/fattura-model';

/**
 * Esito della trasmissione allo SDI, registrato a mano da chi la invia: stato,
 * identificativo e testo della ricevuta. Una fattura scartata si corregge con i file rigenerati.
 */
@Component({
  selector: 'app-sdi-fattura',
  imports: [ReactiveFormsModule, TranslocoPipe, CampoComponent],
  templateUrl: './sdi-fattura-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class SdiFatturaComponent {
  private readonly fatture = inject(FattureService);
  private readonly avvisi = inject(AvvisiService);
  private readonly transloco = inject(TranslocoService);
  protected readonly errori = inject(ErroriService);

  readonly fattura = input.required<FatturaInterface>();
  readonly aggiornata = output<FatturaInterface>();

  /** La bozza si lascia solo emettendo. */
  protected readonly stati = STATI_SDI.filter((stato) => stato !== 'bozza');
  protected readonly lunghezza = LUNGHEZZE_FATTURA;
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    stato_sdi: ['da_inviare' as StatoSdi],
    id_sdi: ['', Validators.maxLength(LUNGHEZZE_FATTURA.idSdi)],
    esito_sdi: ['', Validators.maxLength(LUNGHEZZE_FATTURA.esitoSdi)],
  });

  constructor() {
    effect(() => {
      const { stato_sdi, id_sdi, esito_sdi } = this.fattura();
      this.modulo.reset({ stato_sdi, id_sdi: id_sdi ?? '', esito_sdi: esito_sdi ?? '' });
    });
  }

  /**
   * SALVA
   */
  salva(): void {
    if (this.modulo.invalid) {
      this.modulo.markAllAsTouched();
      return;
    }
    const { stato_sdi, id_sdi, esito_sdi } = this.modulo.getRawValue();
    this.inCorso.set(true);
    this.errore.set('');
    this.fatture
      .aggiornaSdi(this.fattura().id, {
        stato_sdi,
        id_sdi: id_sdi || null,
        esito_sdi: esito_sdi || null,
      })
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: (fattura) => {
          this.avvisi.mostra(
            this.transloco.translate('gestionale.fatture.sdi.salvato'),
            'successo',
          );
          this.aggiornata.emit(fattura);
        },
        error: (motivo: unknown) => this.errore.set(this.errori.messaggio(motivo)),
      });
  }
}
