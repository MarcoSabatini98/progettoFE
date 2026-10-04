import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

import { ErroriService } from '../../../core/services/errori/errori-service';
import { Listino } from '../../../core/services/tariffe/listino';
import {
  LIMITI_TARIFFE,
  TIPI_VARIAZIONE_PIANO,
} from '../../../core/services/tariffe/tariffe-costanti';
import { TariffeService } from '../../../core/services/tariffe/tariffe-service';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import {
  PianoCreaPayload,
  PianoTariffarioInterface,
  TipoVariazionePiano,
} from '../../../shared/models/piano-tariffario/piano-tariffario-model';
import { VariazionePipe } from '../../../shared/pipes/variazione-pipe';
import { AzioniListinoComponent } from '../azioni-listino-component/azioni-listino-component';
import { ListinoComponent } from '../listino-component/listino-component';

/** Piani tariffari: variazione sul prezzo del giorno, cancellazione gratuita, penale e acconto. */
@Component({
  selector: 'app-piani-tariffari',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    CampoComponent,
    ListinoComponent,
    AzioniListinoComponent,
    VariazionePipe,
  ],
  templateUrl: './piani-tariffari-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PianiTariffariComponent {
  private readonly tariffe = inject(TariffeService);
  protected readonly errori = inject(ErroriService);

  protected readonly limiti = LIMITI_TARIFFE;
  protected readonly tipi = TIPI_VARIAZIONE_PIANO;
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    nome: ['', [Validators.required, Validators.maxLength(LIMITI_TARIFFE.nome)]],
    descrizione: ['', Validators.maxLength(LIMITI_TARIFFE.descrizione)],
    tipo_variazione: ['percentuale' as TipoVariazionePiano],
    valore_variazione: [
      0,
      [Validators.min(-LIMITI_TARIFFE.importo), Validators.max(LIMITI_TARIFFE.importo)],
    ],
    rimborsabile: [true],
    ore_cancellazione_gratuita: [48, [Validators.min(0), Validators.max(LIMITI_TARIFFE.ore)]],
    penale_percentuale: [0, [Validators.min(0), Validators.max(100)]],
    acconto_percentuale: [30, [Validators.min(0), Validators.max(100)]],
    predefinito: [false],
    attivo: [true],
    ordine: [0, [Validators.min(0), Validators.max(LIMITI_TARIFFE.ordine)]],
  });
  protected readonly listino = new Listino<PianoTariffarioInterface, PianoCreaPayload>(
    {
      elenca: () => this.tariffe.elencaPiani(),
      crea: (dati) => this.tariffe.creaPiano(dati),
      aggiorna: (id, dati) => this.tariffe.aggiornaPiano(id, dati),
      elimina: (id) => this.tariffe.eliminaPiano(id),
    },
    this.modulo,
  );
}
