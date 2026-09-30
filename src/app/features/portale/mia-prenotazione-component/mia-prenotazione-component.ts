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
import { forkJoin } from 'rxjs';

import { ErroriService } from '../../../core/services/errori/errori-service';
import { PERCORSI_PORTALE } from '../../../core/services/navigazione/navigazione-costanti';
import { PagamentiService } from '../../../core/services/pagamenti/pagamenti-service';
import { STATI_MODIFICABILI_CLIENTE } from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { PrenotazioniService } from '../../../core/services/prenotazioni/prenotazioni-service';
import { RecensioniService } from '../../../core/services/recensioni/recensioni-service';
import { ContoPrenotazioneComponent } from '../../../shared/conto-prenotazione-component/conto-prenotazione-component';
import { DettagliPrenotazioneComponent } from '../../../shared/dettagli-prenotazione-component/dettagli-prenotazione-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { MetodoOnline } from '../../../shared/models/pagamento/pagamento-model';
import { StatoPrenotazione } from '../../../shared/models/prenotazione/prenotazione-model';
import { RecensioneCreaPayload } from '../../../shared/models/recensione/recensione-model';
import { ModuloRecensioneComponent } from '../../../shared/modulo-recensione-component/modulo-recensione-component';
import { PagamentoPrenotazioneComponent } from '../../../shared/pagamento-prenotazione-component/pagamento-prenotazione-component';
import { CancellaPrenotazioneComponent } from '../cancella-prenotazione-component/cancella-prenotazione-component';
import { ExtraPrenotazioneComponent } from '../extra-prenotazione-component/extra-prenotazione-component';

const STATI_MODIFICABILI: readonly StatoPrenotazione[] = STATI_MODIFICABILI_CLIENTE;

/**
 * Prenotazione del cliente collegato: dettagli, conto e pagamento; finché è in attesa
 * o confermata si cambiano gli extra o la si cancella, a soggiorno concluso si recensisce.
 */
@Component({
  selector: 'app-mia-prenotazione',
  imports: [
    RouterLink,
    TranslocoPipe,
    CancellaPrenotazioneComponent,
    ContoPrenotazioneComponent,
    DettagliPrenotazioneComponent,
    ExtraPrenotazioneComponent,
    IconaComponent,
    ModuloRecensioneComponent,
    PagamentoPrenotazioneComponent,
  ],
  templateUrl: './mia-prenotazione-component.html',
  styleUrl: './mia-prenotazione-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'sezione' },
})
export class MiaPrenotazioneComponent {
  private readonly pagamenti = inject(PagamentiService);
  private readonly prenotazioni = inject(PrenotazioniService);
  private readonly recensioni = inject(RecensioniService);
  protected readonly errori = inject(ErroriService);

  /** Id dal percorso. */
  readonly id = input.required({ transform: numberAttribute });

  protected readonly elenco = PERCORSI_PORTALE.prenotazioni;
  protected readonly dati = rxResource({
    params: () => this.id(),
    stream: ({ params: id }) =>
      forkJoin({
        prenotazione: this.prenotazioni.leggiPrenotazione(id, true),
        pagamento: this.pagamenti.leggiRiepilogo(id, true),
      }),
  });
  protected readonly modificabile = computed(
    () => this.dati.hasValue() && STATI_MODIFICABILI.includes(this.dati.value().prenotazione.stato),
  );

  protected readonly avvia = (metodo: MetodoOnline) =>
    this.pagamenti.avviaOnline(this.id(), { metodo }, true);

  protected readonly recensisci = (dati: RecensioneCreaPayload) =>
    this.recensioni.creaRecensione(this.id(), dati);
}
