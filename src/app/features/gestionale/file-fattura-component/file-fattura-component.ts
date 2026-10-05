import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { salvaFile } from '../../../core/services/api/salva-file';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { FattureService } from '../../../core/services/fatture/fatture-service';
import { TIPI_FILE_FATTURA } from '../../../core/services/pagamenti/pagamenti-costanti';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { FatturaInterface, TipoFileFattura } from '../../../shared/models/fattura/fattura-model';

/**
 * PDF di cortesia e XML FatturaPA di una fattura emessa, da scaricare o rigenerare
 * (dopo aver corretto i dati fiscali della struttura, o se un file è andato perso).
 */
@Component({
  selector: 'app-file-fattura',
  imports: [TranslocoPipe, IconaComponent],
  templateUrl: './file-fattura-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class FileFatturaComponent {
  private readonly documento = inject(DOCUMENT);
  private readonly fatture = inject(FattureService);
  private readonly avvisi = inject(AvvisiService);
  private readonly transloco = inject(TranslocoService);
  private readonly errori = inject(ErroriService);

  readonly fattura = input.required<FatturaInterface>();
  readonly aggiornata = output<FatturaInterface>();

  protected readonly tipi = TIPI_FILE_FATTURA;
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');

  /**
   * SCARICA
   */
  scarica(tipo: TipoFileFattura): void {
    const { id, anno, sezionale, numero } = this.fattura();
    this.inizia();
    this.fatture
      .scaricaFile(id, tipo)
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: (file) => salvaFile(this.documento, file, `${anno}-${sezionale}${numero}.${tipo}`),
        error: (motivo: unknown) => this.errore.set(this.errori.messaggio(motivo)),
      });
  }

  /**
   * RIGENERA
   */
  rigenera(): void {
    this.inizia();
    this.fatture
      .rigeneraFile(this.fattura().id)
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: (fattura) => {
          this.avvisi.mostra(
            this.transloco.translate('gestionale.fatture.file.rigenerati'),
            'successo',
          );
          this.aggiornata.emit(fattura);
        },
        error: (motivo: unknown) => this.errore.set(this.errori.messaggio(motivo)),
      });
  }

  private inizia(): void {
    this.inCorso.set(true);
    this.errore.set('');
  }
}
