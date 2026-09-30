import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';

import { ICONA_SERVIZIO_PREDEFINITA } from '../../../core/services/camere/camere-costanti';
import { TariffeService } from '../../../core/services/tariffe/tariffe-service';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { DataPipe } from '../../../shared/pipes/data-pipe';
import { MediaPipe } from '../../../shared/pipes/media-pipe';
import { PrezzoPipe } from '../../../shared/pipes/prezzo-pipe';
import { VotoPipe } from '../../../shared/pipes/voto-pipe';

/** Offerte del sito (/offerte): pacchetti a prezzo fisso e promozioni in corso. */
@Component({
  selector: 'app-offerte',
  imports: [TranslocoPipe, IconaComponent, DataPipe, MediaPipe, PrezzoPipe, VotoPipe],
  templateUrl: './offerte-component.html',
  styleUrl: './offerte-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class OfferteComponent {
  private readonly tariffe = inject(TariffeService);

  protected readonly iconaPredefinita = ICONA_SERVIZIO_PREDEFINITA;
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
}
