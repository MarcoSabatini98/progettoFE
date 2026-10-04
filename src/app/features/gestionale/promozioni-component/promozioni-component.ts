import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

import { ErroriService } from '../../../core/services/errori/errori-service';
import { Listino } from '../../../core/services/tariffe/listino';
import { LIMITI_TARIFFE, TIPI_SCONTO } from '../../../core/services/tariffe/tariffe-costanti';
import { TariffeService } from '../../../core/services/tariffe/tariffe-service';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import {
  PromozioneCreaPayload,
  PromozioneInterface,
  TipoSconto,
} from '../../../shared/models/promozione/promozione-model';
import { TipologiaCameraInterface } from '../../../shared/models/tipologia-camera/tipologia-camera-model';
import { DataPipe } from '../../../shared/pipes/data-pipe';
import { VariazionePipe } from '../../../shared/pipes/variazione-pipe';
import { AzioniListinoComponent } from '../azioni-listino-component/azioni-listino-component';
import { ListinoComponent } from '../listino-component/listino-component';

/** Promozioni: sconto automatico per i soggiorni in un periodo, prenotati in una finestra. */
@Component({
  selector: 'app-promozioni',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    CampoComponent,
    ListinoComponent,
    AzioniListinoComponent,
    VariazionePipe,
    DataPipe,
  ],
  templateUrl: './promozioni-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromozioniComponent {
  private readonly tariffe = inject(TariffeService);
  protected readonly errori = inject(ErroriService);

  readonly tipologie = input.required<TipologiaCameraInterface[]>();

  protected readonly limiti = LIMITI_TARIFFE;
  protected readonly tipi = TIPI_SCONTO;
  private readonly piccolo = [Validators.min(1), Validators.max(LIMITI_TARIFFE.piccolo)];
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    nome: ['', [Validators.required, Validators.maxLength(LIMITI_TARIFFE.nome)]],
    descrizione: ['', Validators.maxLength(LIMITI_TARIFFE.descrizione)],
    tipologia_id: [null as number | null],
    soggiorno_dal: ['', Validators.required],
    soggiorno_al: ['', Validators.required],
    prenotabile_dal: [''],
    prenotabile_al: [''],
    tipo_sconto: ['percentuale' as TipoSconto],
    valore: [
      null as number | null,
      [Validators.required, Validators.min(0.01), Validators.max(LIMITI_TARIFFE.importo)],
    ],
    ospiti_min: [null as number | null, this.piccolo],
    ospiti_max: [null as number | null, this.piccolo],
    notti_min: [null as number | null, this.piccolo],
    attiva: [true],
  });
  protected readonly listino = new Listino<PromozioneInterface, PromozioneCreaPayload>(
    {
      elenca: () => this.tariffe.elencaPromozioni(),
      crea: (dati) => this.tariffe.creaPromozione(dati),
      aggiorna: (id, dati) => this.tariffe.aggiornaPromozione(id, dati),
      elimina: (id) => this.tariffe.eliminaPromozione(id),
    },
    this.modulo,
  );
}
