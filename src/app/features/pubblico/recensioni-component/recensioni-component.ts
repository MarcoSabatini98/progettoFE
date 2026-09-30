import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';

import { accodaPagine } from '../../../core/services/api/pagine-accodate';
import {
  CATEGORIE_VOTO,
  VOTI_RECENSIONE,
} from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { RecensioniService } from '../../../core/services/recensioni/recensioni-service';
import { ValutazioniInterface } from '../../../shared/models/valutazioni/valutazioni-model';
import { VotoPipe } from '../../../shared/pipes/voto-pipe';
import { SchedaRecensioneComponent } from '../scheda-recensione-component/scheda-recensione-component';

/** Recensioni caricate a ogni "mostra altre". */
const RECENSIONI_PER_PAGINA = 10;

/** Medie di dettaglio mostrate sotto quella generale, nell'ordine del modulo di recensione. */
const CATEGORIE_VALUTAZIONE = CATEGORIE_VOTO.map(
  (categoria) => `media_${categoria}` as const,
) satisfies (keyof ValutazioniInterface)[];

/**
 * Recensioni del sito (/recensioni): medie dei voti e recensioni in tutte le lingue,
 * dalla più recente, caricate a blocchi.
 */
@Component({
  selector: 'app-recensioni',
  imports: [TranslocoPipe, VotoPipe, SchedaRecensioneComponent],
  templateUrl: './recensioni-component.html',
  styleUrl: './recensioni-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class RecensioniComponent {
  private readonly recensioni = inject(RecensioniService);

  protected readonly valutazioni = rxResource({
    stream: () => this.recensioni.leggiValutazioni(),
  });
  /** Tutte le lingue, dalla più recente. */
  protected readonly elenco = accodaPagine(
    (parametri) => this.recensioni.elencaPubbliche(parametri),
    RECENSIONI_PER_PAGINA,
  );

  /** Medie di dettaglio presenti (le recensioni senza voti di dettaglio non le hanno). */
  protected readonly categorie = computed(() => {
    if (!this.valutazioni.hasValue()) {
      return [];
    }
    const valutazioni = this.valutazioni.value();
    return CATEGORIE_VALUTAZIONE.flatMap((categoria) => {
      const media = valutazioni[categoria];
      return media === null || media === undefined ? [] : [{ categoria, media }];
    });
  });

  /** Larghezza della barra, in proporzione al voto più alto: la media arriva come testo dalla vista ("4.50"). */
  protected percentuale(media: number | string): number {
    return (Number(media) / VOTI_RECENSIONE.length) * 100;
  }
}
