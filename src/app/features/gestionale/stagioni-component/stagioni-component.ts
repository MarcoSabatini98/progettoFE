import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

import { ErroriService } from '../../../core/services/errori/errori-service';
import { Listino } from '../../../core/services/tariffe/listino';
import {
  GIORNI_SETTIMANA,
  LIMITI_TARIFFE,
  TIPI_VARIAZIONE_PERIODO,
  TUTTI_I_GIORNI,
} from '../../../core/services/tariffe/tariffe-costanti';
import { TariffeService } from '../../../core/services/tariffe/tariffe-service';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import {
  PeriodoTariffarioCreaPayload,
  PeriodoTariffarioInterface,
  TipoVariazionePeriodo,
} from '../../../shared/models/periodo-tariffario/periodo-tariffario-model';
import { TipologiaCameraInterface } from '../../../shared/models/tipologia-camera/tipologia-camera-model';
import { DataPipe } from '../../../shared/pipes/data-pipe';
import { VariazionePipe } from '../../../shared/pipes/variazione-pipe';
import { AzioniListinoComponent } from '../azioni-listino-component/azioni-listino-component';
import { ListinoComponent } from '../listino-component/listino-component';

/** Stagioni: periodi con prezzo diverso, per tutte le tipologie o una sola, anche solo certi giorni. */
@Component({
  selector: 'app-stagioni',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    CampoComponent,
    ListinoComponent,
    AzioniListinoComponent,
    VariazionePipe,
    DataPipe,
  ],
  templateUrl: './stagioni-component.html',
  styleUrl: './stagioni-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StagioniComponent {
  private readonly tariffe = inject(TariffeService);
  protected readonly errori = inject(ErroriService);

  readonly tipologie = input.required<TipologiaCameraInterface[]>();

  protected readonly limiti = LIMITI_TARIFFE;
  protected readonly tipi = TIPI_VARIAZIONE_PERIODO;
  protected readonly giorni = GIORNI_SETTIMANA;
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    nome: ['', [Validators.required, Validators.maxLength(LIMITI_TARIFFE.nome)]],
    tipologia_id: [null as number | null],
    data_inizio: ['', Validators.required],
    data_fine: ['', Validators.required],
    tipo_variazione: ['percentuale' as TipoVariazionePeriodo],
    valore: [
      0,
      [
        Validators.required,
        Validators.min(-LIMITI_TARIFFE.importo),
        Validators.max(LIMITI_TARIFFE.importo),
      ],
    ],
    giorni_settimana: [TUTTI_I_GIORNI as number, Validators.min(1)],
    soggiorno_minimo: [
      null as number | null,
      [Validators.min(1), Validators.max(LIMITI_TARIFFE.piccolo)],
    ],
    priorita: [0, [Validators.min(0), Validators.max(LIMITI_TARIFFE.priorita)]],
    attivo: [true],
  });
  protected readonly listino = new Listino<
    PeriodoTariffarioInterface,
    PeriodoTariffarioCreaPayload
  >(
    {
      elenca: () => this.tariffe.elencaPeriodi(),
      crea: (dati) => this.tariffe.creaPeriodo(dati),
      aggiorna: (id, dati) => this.tariffe.aggiornaPeriodo(id, dati),
      elimina: (id) => this.tariffe.eliminaPeriodo(id),
    },
    this.modulo,
  );

  /** I template non hanno operatori sui bit. */
  haGiorno(bit: number): boolean {
    return (this.modulo.controls.giorni_settimana.value & bit) !== 0;
  }

  /**
   * GIORNO
   * Accende o spegne il bit del giorno.
   */
  giorno(bit: number, incluso: boolean): void {
    const controllo = this.modulo.controls.giorni_settimana;
    controllo.setValue(incluso ? controllo.value | bit : controllo.value & ~bit);
    controllo.markAsDirty();
  }
}
