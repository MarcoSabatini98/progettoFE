import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { ICONA_SERVIZIO_PREDEFINITA } from '../../../core/services/camere/camere-costanti';
import { dataCalendario, giorniTra } from '../../../core/services/disponibilita/date-soggiorno';
import { PERCORSI_PUBBLICI } from '../../../core/services/navigazione/navigazione-costanti';
import { GIORNI_SCADENZA_VICINA } from '../../../core/services/tariffe/tariffe-costanti';
import { TariffeService } from '../../../core/services/tariffe/tariffe-service';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { DataPipe } from '../../../shared/pipes/data-pipe';
import { MediaPipe } from '../../../shared/pipes/media-pipe';
import { PromozioneInterface } from '../../../shared/models/promozione/promozione-model';
import { PrezzoPipe } from '../../../shared/pipes/prezzo-pipe';
import { VotoPipe } from '../../../shared/pipes/voto-pipe';

/**
 * Offerte del sito (/offerte): prima le promozioni in corso, poi i pacchetti a prezzo fisso.
 * In ogni sezione la prima offerta va in vetrina, le altre in griglia; ognuna porta a
 * prenotare la sua tipologia e segnala gli ultimi giorni prima della fine.
 */
@Component({
  selector: 'app-offerte',
  imports: [
    NgTemplateOutlet,
    RouterLink,
    TranslocoPipe,
    IconaComponent,
    DataPipe,
    MediaPipe,
    PrezzoPipe,
    VotoPipe,
  ],
  templateUrl: './offerte-component.html',
  styleUrl: './offerte-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class OfferteComponent {
  private readonly tariffe = inject(TariffeService);

  protected readonly iconaPredefinita = ICONA_SERVIZIO_PREDEFINITA;
  protected readonly percorsoPrenota = PERCORSI_PUBBLICI.prenota;
  private readonly oggi = dataCalendario(new Date());
  protected readonly pacchetti = rxResource({
    stream: () => this.tariffe.elencaPacchettiPubblici(),
  });
  protected readonly promozioni = rxResource({
    stream: () => this.tariffe.elencaPromozioniPubbliche(),
  });

  protected readonly elencoPacchetti = computed(() =>
    this.pacchetti.hasValue() ? this.pacchetti.value() : [],
  );
  protected readonly elencoPromozioni = computed(() =>
    this.promozioni.hasValue() ? this.promozioni.value() : [],
  );
  /** Finito di caricare e niente da mostrare: per errore o perché non ci sono offerte. */
  protected readonly vuota = computed(
    () =>
      !this.pacchetti.isLoading() &&
      !this.promozioni.isLoading() &&
      !this.elencoPacchetti().length &&
      !this.elencoPromozioni().length,
  );
  protected readonly errore = computed(() => !!(this.pacchetti.error() || this.promozioni.error()));

  /** Giorni rimasti, oggi compreso, se l'offerta finisce a breve; altrimenti 0. */
  protected ultimiGiorni(fine: string | null): number {
    const rimasti = fine ? giorniTra(this.oggi, fine) + 1 : Infinity;
    return rimasti <= GIORNI_SCADENZA_VICINA ? rimasti : 0;
  }

  /** Fine della promozione: chiude la finestra di prenotazione o quella dei soggiorni. */
  protected finePromozione(promozione: PromozioneInterface): string {
    const { prenotabile_al, soggiorno_al } = promozione;
    return prenotabile_al && prenotabile_al < soggiorno_al ? prenotabile_al : soggiorno_al;
  }
}
