import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

import { Listino } from '../../../core/services/api/listino';
import {
  IMPATTO_PREDEFINITO,
  LIMITI_CONTENUTI,
} from '../../../core/services/contenuti/contenuti-costanti';
import { ContenutiService } from '../../../core/services/contenuti/contenuti-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { TIPI_EVENTO_SPECIALE } from '../../../core/services/sistema/sistema-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import {
  EventoSpecialeCreaPayload,
  EventoSpecialeInterface,
  TipoEventoSpeciale,
} from '../../../shared/models/evento-speciale/evento-speciale-model';
import { DataPipe } from '../../../shared/pipes/data-pipe';
import { AzioniListinoComponent } from '../azioni-listino-component/azioni-listino-component';
import { ListinoComponent } from '../listino-component/listino-component';

/** Eventi in zona (fiere, feste): alzano la domanda e pesano sul prezzo suggerito. */
@Component({
  selector: 'app-eventi',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    CampoComponent,
    ListinoComponent,
    AzioniListinoComponent,
    DataPipe,
  ],
  templateUrl: './eventi-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventiComponent {
  private readonly contenuti = inject(ContenutiService);
  protected readonly errori = inject(ErroriService);

  protected readonly tipi = TIPI_EVENTO_SPECIALE;
  protected readonly limiti = LIMITI_CONTENUTI;
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    titolo: ['', [Validators.required, Validators.maxLength(LIMITI_CONTENUTI.titolo)]],
    tipo: ['evento_locale' as TipoEventoSpeciale],
    data_inizio: ['', Validators.required],
    data_fine: ['', Validators.required],
    impatto: [
      IMPATTO_PREDEFINITO,
      [Validators.required, Validators.min(1), Validators.max(LIMITI_CONTENUTI.impatto)],
    ],
    note: ['', Validators.maxLength(LIMITI_CONTENUTI.note)],
  });
  protected readonly listino = new Listino<EventoSpecialeInterface, EventoSpecialeCreaPayload>(
    {
      elenca: () => this.contenuti.elencaEventi(),
      crea: (dati) => this.contenuti.creaEvento(dati),
      aggiorna: (id, dati) => this.contenuti.aggiornaEvento(id, dati),
      elimina: (id) => this.contenuti.eliminaEvento(id),
    },
    this.modulo,
  );
}
