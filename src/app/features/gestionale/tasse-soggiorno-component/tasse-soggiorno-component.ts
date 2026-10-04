import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

import { ErroriService } from '../../../core/services/errori/errori-service';
import { Listino } from '../../../core/services/tariffe/listino';
import { LIMITI_TARIFFE } from '../../../core/services/tariffe/tariffe-costanti';
import { TariffeService } from '../../../core/services/tariffe/tariffe-service';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import {
  TassaCreaPayload,
  TassaSoggiornoInterface,
} from '../../../shared/models/tassa-soggiorno/tassa-soggiorno-model';
import { DataPipe } from '../../../shared/pipes/data-pipe';
import { PrezzoPipe } from '../../../shared/pipes/prezzo-pipe';
import { AzioniListinoComponent } from '../azioni-listino-component/azioni-listino-component';
import { ListinoComponent } from '../listino-component/listino-component';

/**
 * Tassa di soggiorno del comune, periodo per periodo.
 * Quando sta per finire senza una successiva, chi gestisce le tariffe riceve un avviso.
 */
@Component({
  selector: 'app-tasse-soggiorno',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    CampoComponent,
    ListinoComponent,
    AzioniListinoComponent,
    PrezzoPipe,
    DataPipe,
  ],
  templateUrl: './tasse-soggiorno-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasseSoggiornoComponent {
  private readonly tariffe = inject(TariffeService);
  protected readonly errori = inject(ErroriService);

  protected readonly limiti = LIMITI_TARIFFE;
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    nome: ['', [Validators.required, Validators.maxLength(LIMITI_TARIFFE.nome)]],
    valida_dal: ['', Validators.required],
    valida_al: ['', Validators.required],
    importo_notte: [
      null as number | null,
      [Validators.required, Validators.min(0), Validators.max(LIMITI_TARIFFE.importoTassa)],
    ],
    notti_max: [null as number | null, [Validators.min(1), Validators.max(LIMITI_TARIFFE.piccolo)]],
    eta_esenzione: [null as number | null, [Validators.min(0), Validators.max(LIMITI_TARIFFE.eta)]],
    attiva: [true],
  });
  protected readonly listino = new Listino<TassaSoggiornoInterface, TassaCreaPayload>(
    {
      elenca: () => this.tariffe.elencaTasse(),
      crea: (dati) => this.tariffe.creaTassa(dati),
      aggiorna: (id, dati) => this.tariffe.aggiornaTassa(id, dati),
      elimina: (id) => this.tariffe.eliminaTassa(id),
    },
    this.modulo,
  );
}
