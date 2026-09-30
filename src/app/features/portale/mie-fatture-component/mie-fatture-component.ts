import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';

import { salvaFile } from '../../../core/services/api/salva-file';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { FattureService } from '../../../core/services/fatture/fatture-service';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { FatturaInterface } from '../../../shared/models/fattura/fattura-model';
import { DataPipe } from '../../../shared/pipes/data-pipe';
import { PrezzoPipe } from '../../../shared/pipes/prezzo-pipe';

/** Fatture e note di credito emesse al cliente, con il PDF da scaricare. */
@Component({
  selector: 'app-mie-fatture',
  imports: [TranslocoPipe, IconaComponent, DataPipe, PrezzoPipe],
  templateUrl: './mie-fatture-component.html',
  styleUrl: './mie-fatture-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'sezione' },
})
export class MieFattureComponent {
  private readonly documento = inject(DOCUMENT);
  private readonly fatture = inject(FattureService);
  protected readonly errori = inject(ErroriService);

  protected readonly elenco = rxResource({ stream: () => this.fatture.elencaMie() });
  /** Fattura in download: il suo pulsante resta disabilitato. */
  protected readonly inDownload = signal<number | undefined>(undefined);
  protected readonly errore = signal<string | undefined>(undefined);

  /**
   * SCARICA
   */
  scarica(fattura: FatturaInterface): void {
    this.inDownload.set(fattura.id);
    this.errore.set(undefined);
    this.fatture.scaricaFile(fattura.id, 'pdf', true).subscribe({
      next: (file) => {
        this.inDownload.set(undefined);
        salvaFile(
          this.documento,
          file,
          `${fattura.anno}-${fattura.sezionale}${fattura.numero}.pdf`,
        );
      },
      error: (err: unknown) => {
        this.inDownload.set(undefined);
        this.errore.set(this.errori.messaggio(err));
      },
    });
  }
}
