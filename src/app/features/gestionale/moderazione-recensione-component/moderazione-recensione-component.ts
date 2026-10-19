import { UpperCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { ErroriService } from '../../../core/services/errori/errori-service';
import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import { CATEGORIE_VOTO } from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { RecensioniService } from '../../../core/services/recensioni/recensioni-service';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { DataPipe } from '../../../shared/pipes/data-pipe';
import { PaesePipe } from '../../../shared/pipes/paese-pipe';
import { GestioneRecensioneComponent } from '../gestione-recensione-component/gestione-recensione-component';

/**
 * Scheda di una recensione (anche dal link della notifica): voti, commento, chi l'ha
 * scritta e per quale soggiorno. Da qui si pubblica, si rifiuta e si risponde.
 */
@Component({
  selector: 'app-moderazione-recensione',
  imports: [
    RouterLink,
    UpperCasePipe,
    TranslocoPipe,
    DataPipe,
    PaesePipe,
    IconaComponent,
    GestioneRecensioneComponent,
  ],
  templateUrl: './moderazione-recensione-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class ModerazioneRecensioneComponent {
  private readonly recensioni = inject(RecensioniService);
  protected readonly errori = inject(ErroriService);

  /** Id dal percorso. */
  readonly id = input.required({ transform: numberAttribute });

  protected readonly elenco = PERCORSI_STAFF.recensioni;
  protected readonly prenotazioni = PERCORSI_STAFF.prenotazioni;
  protected readonly scheda = rxResource({
    params: () => this.id(),
    stream: ({ params: id }) => this.recensioni.leggiRecensione(id),
  });

  /** Voti di dettaglio dati dall'ospite, nell'ordine del modulo. */
  protected readonly voti = computed(() => {
    if (!this.scheda.hasValue()) return [];
    const recensione = this.scheda.value();
    return CATEGORIE_VOTO.map((categoria) => ({
      categoria,
      voto: recensione[`voto_${categoria}` as const],
    })).filter(({ voto }) => voto !== null);
  });
}
