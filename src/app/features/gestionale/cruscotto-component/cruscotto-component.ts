import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Params, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AnalyticsService } from '../../../core/services/analytics/analytics-service';
import { AuthService } from '../../../core/services/auth/auth-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import { PERMESSI } from '../../../core/services/ruoli/ruoli-costanti';
import { AndamentoComponent } from '../andamento-component/andamento-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { CruscottoInterface } from '../../../shared/models/cruscotto/cruscotto-model';
import { RequisitiAccessoInterface } from '../../../shared/models/requisiti-accesso/requisiti-accesso-model';
import { PrezzoPipe } from '../../../shared/pipes/prezzo-pipe';

/** Un numero del cruscotto; con percorso porta dove ci si lavora, a chi ha i permessi. */
type Tessera = RequisitiAccessoInterface & {
  chiave: keyof CruscottoInterface;
  /** Nome Material Symbols. */
  icona: string;
  formato?: 'percentuale' | 'prezzo';
  percorso?: string;
  filtri?: Params;
};

const SOGGIORNI = { percorso: PERCORSI_STAFF.oggi, permessi: [PERMESSI.PRENOTAZIONI_LEGGI] };

/** Gruppi di tessere, ognuno con la sua chiave di titolo. */
const GRUPPI: readonly { titolo: string; tessere: readonly Tessera[] }[] = [
  {
    titolo: 'oggi',
    tessere: [
      { chiave: 'occupazione_oggi', icona: 'hotel', formato: 'percentuale' },
      { chiave: 'arrivi_oggi', icona: 'login', ...SOGGIORNI },
      { chiave: 'partenze_oggi', icona: 'logout', ...SOGGIORNI },
      { chiave: 'in_casa', icona: 'bed', ...SOGGIORNI },
    ],
  },
  {
    titolo: 'daFare',
    tessere: [
      {
        chiave: 'da_confermare',
        icona: 'pending_actions',
        percorso: PERCORSI_STAFF.prenotazioni,
        filtri: { stato: 'in_attesa' },
        permessi: [PERMESSI.PRENOTAZIONI_LEGGI],
      },
      {
        chiave: 'manutenzioni_aperte',
        icona: 'build',
        percorso: PERCORSI_STAFF.manutenzione,
        permessi: [PERMESSI.MANUTENZIONE_SEGNALA],
      },
      {
        chiave: 'recensioni_da_moderare',
        icona: 'reviews',
        percorso: PERCORSI_STAFF.recensioni,
        permessi: [PERMESSI.RECENSIONI_MODERA],
      },
    ],
  },
  {
    titolo: 'mese',
    tessere: [
      { chiave: 'incassato_mese', icona: 'payments', formato: 'prezzo' },
      { chiave: 'prenotato_da_inizio_mese', icona: 'event_available', formato: 'prezzo' },
    ],
  },
];

/**
 * Cruscotto della direzione: occupazione e movimenti di oggi, cosa aspetta
 * qualcuno, gli importi del mese e sotto l'andamento di un periodo a scelta.
 */
@Component({
  selector: 'app-cruscotto',
  imports: [
    NgTemplateOutlet,
    RouterLink,
    TranslocoPipe,
    AndamentoComponent,
    IconaComponent,
    PrezzoPipe,
  ],
  templateUrl: './cruscotto-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class CruscottoComponent {
  private readonly analytics = inject(AnalyticsService);
  private readonly auth = inject(AuthService);
  protected readonly errori = inject(ErroriService);

  protected readonly gruppi = GRUPPI;
  protected readonly numeri = rxResource({ stream: () => this.analytics.leggiCruscotto() });

  /** La tessera si apre solo se porta a una pagina permessa. */
  apribile(tessera: Tessera): boolean {
    return !!tessera.percorso && this.auth.puoAccedere(tessera);
  }
}
