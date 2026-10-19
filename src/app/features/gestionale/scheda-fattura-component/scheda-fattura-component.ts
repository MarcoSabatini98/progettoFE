import { ChangeDetectionStrategy, Component, inject, input, numberAttribute } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AuthService } from '../../../core/services/auth/auth-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { FattureService } from '../../../core/services/fatture/fatture-service';
import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import { RUOLI } from '../../../core/services/ruoli/ruoli-costanti';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { FatturaInterface } from '../../../shared/models/fattura/fattura-model';
import { DataPipe } from '../../../shared/pipes/data-pipe';
import { PrezzoPipe } from '../../../shared/pipes/prezzo-pipe';
import { BozzaFatturaComponent } from '../bozza-fattura-component/bozza-fattura-component';
import { EliminaComponent } from '../elimina-component/elimina-component';
import { FileFatturaComponent } from '../file-fattura-component/file-fattura-component';
import { NotaDiCreditoComponent } from '../nota-di-credito-component/nota-di-credito-component';
import { SdiFatturaComponent } from '../sdi-fattura-component/sdi-fattura-component';
import { StoriaRecordComponent } from '../storia-record-component/storia-record-component';

/**
 * Scheda di una fattura (anche dai link delle notifiche): intestatario, righe e totali.
 * La bozza si modifica, si emette o si elimina; quella emessa si scarica, si segue
 * allo SDI e, se è una fattura, si storna con una nota di credito.
 */
@Component({
  selector: 'app-scheda-fattura',
  imports: [
    RouterLink,
    TranslocoPipe,
    DataPipe,
    PrezzoPipe,
    IconaComponent,
    BozzaFatturaComponent,
    EliminaComponent,
    FileFatturaComponent,
    NotaDiCreditoComponent,
    SdiFatturaComponent,
    StoriaRecordComponent,
  ],
  templateUrl: './scheda-fattura-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class SchedaFatturaComponent {
  private readonly fatture = inject(FattureService);
  private readonly router = inject(Router);
  protected readonly errori = inject(ErroriService);

  /** Id dal percorso. */
  readonly id = input.required({ transform: numberAttribute });

  protected readonly percorsi = PERCORSI_STAFF;
  protected readonly storia = inject(AuthService).haRuolo([RUOLI.ADMIN]);
  protected readonly scheda = rxResource({
    params: () => this.id(),
    stream: ({ params: id }) => this.fatture.leggiFattura(id),
  });
  protected readonly elimina = () => this.fatture.eliminaBozza(this.id());

  /**
   * APRI
   * Dopo l'eliminazione l'elenco, dopo lo storno la nota di credito.
   */
  apri(fattura?: FatturaInterface): void {
    void this.router.navigate(
      fattura ? [PERCORSI_STAFF.fatture, fattura.id] : [PERCORSI_STAFF.fatture],
    );
  }
}
