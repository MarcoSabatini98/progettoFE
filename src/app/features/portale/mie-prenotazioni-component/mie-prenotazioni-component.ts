import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { accodaPagine } from '../../../core/services/api/pagine-accodate';
import {
  PERCORSI_PORTALE,
  PERCORSI_PUBBLICI,
} from '../../../core/services/navigazione/navigazione-costanti';
import { STATI_ATTIVI } from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { PrenotazioniService } from '../../../core/services/prenotazioni/prenotazioni-service';
import { StatoPrenotazione } from '../../../shared/models/prenotazione/prenotazione-model';
import { DataPipe } from '../../../shared/pipes/data-pipe';

const PRENOTAZIONI_PER_PAGINA = 12;
const STATI_PROSSIMI: readonly StatoPrenotazione[] = STATI_ATTIVI;

/** Prenotazioni del cliente: prima le prossime (dalla più vicina), poi lo storico. */
@Component({
  selector: 'app-mie-prenotazioni',
  imports: [NgTemplateOutlet, RouterLink, TranslocoPipe, DataPipe],
  templateUrl: './mie-prenotazioni-component.html',
  styleUrl: './mie-prenotazioni-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'sezione' },
})
export class MiePrenotazioniComponent {
  private readonly prenotazioni = inject(PrenotazioniService);

  protected readonly percorsi = { ...PERCORSI_PORTALE, prenota: PERCORSI_PUBBLICI.prenota };
  protected readonly elenco = accodaPagine(
    (parametri) => this.prenotazioni.elencaMie(parametri),
    PRENOTAZIONI_PER_PAGINA,
  );

  // Il backend ordina per arrivo decrescente: le prossime si rovesciano.
  protected readonly prossime = computed(() =>
    this.elenco
      .mostrate()
      .filter((prenotazione) => STATI_PROSSIMI.includes(prenotazione.stato))
      .reverse(),
  );
  protected readonly passate = computed(() =>
    this.elenco.mostrate().filter((prenotazione) => !STATI_PROSSIMI.includes(prenotazione.stato)),
  );
}
