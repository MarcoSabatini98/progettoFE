import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

import { ErroriService } from '../../../core/services/errori/errori-service';
import { Listino } from '../../../core/services/api/listino';
import {
  FORMATO_CODICE_SCONTO,
  LIMITI_TARIFFE,
  TIPI_SCONTO,
} from '../../../core/services/tariffe/tariffe-costanti';
import { TariffeService } from '../../../core/services/tariffe/tariffe-service';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import {
  CodiceScontoCreaPayload,
  CodiceScontoInterface,
} from '../../../shared/models/codice-sconto/codice-sconto-model';
import { TipoSconto } from '../../../shared/models/promozione/promozione-model';
import { DataPipe } from '../../../shared/pipes/data-pipe';
import { VariazionePipe } from '../../../shared/pipes/variazione-pipe';
import { AzioniListinoComponent } from '../azioni-listino-component/azioni-listino-component';
import { ListinoComponent } from '../listino-component/listino-component';

/** Codici sconto da dare ai clienti (es. ESTATE10): validità, minimi e quante volte si usano. */
@Component({
  selector: 'app-codici-sconto',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    CampoComponent,
    ListinoComponent,
    AzioniListinoComponent,
    VariazionePipe,
    DataPipe,
  ],
  templateUrl: './codici-sconto-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodiciScontoComponent {
  private readonly tariffe = inject(TariffeService);
  protected readonly errori = inject(ErroriService);

  protected readonly limiti = LIMITI_TARIFFE;
  protected readonly tipi = TIPI_SCONTO;
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    codice: [
      '',
      [
        Validators.required,
        Validators.maxLength(LIMITI_TARIFFE.codice),
        Validators.pattern(FORMATO_CODICE_SCONTO),
      ],
    ],
    descrizione: ['', Validators.maxLength(LIMITI_TARIFFE.descrizioneCodice)],
    tipo_sconto: ['percentuale' as TipoSconto],
    valore: [
      null as number | null,
      [Validators.required, Validators.min(0.01), Validators.max(LIMITI_TARIFFE.importo)],
    ],
    valido_dal: [''],
    valido_al: [''],
    importo_minimo: [
      null as number | null,
      [Validators.min(0), Validators.max(LIMITI_TARIFFE.importo)],
    ],
    notti_min: [null as number | null, [Validators.min(1), Validators.max(LIMITI_TARIFFE.piccolo)]],
    utilizzi_max: [null as number | null, Validators.min(1)],
    utilizzi_per_utente: [
      null as number | null,
      [Validators.min(1), Validators.max(LIMITI_TARIFFE.utilizziPerUtente)],
    ],
    attivo: [true],
  });
  protected readonly listino = new Listino<CodiceScontoInterface, CodiceScontoCreaPayload>(
    {
      elenca: () => this.tariffe.elencaCodiciSconto(),
      crea: (dati) => this.tariffe.creaCodiceSconto(dati),
      aggiorna: (id, dati) => this.tariffe.aggiornaCodiceSconto(id, dati),
      elimina: (id) => this.tariffe.eliminaCodiceSconto(id),
    },
    this.modulo,
  );

  /**
   * MAIUSCOLE
   * Il codice si scrive come lo salva il backend.
   */
  maiuscole(): void {
    const controllo = this.modulo.controls.codice;
    controllo.setValue(controllo.value.toUpperCase().trim());
  }
}
