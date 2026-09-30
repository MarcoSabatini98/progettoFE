import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';

import { RecensioniService } from '../../../core/services/recensioni/recensioni-service';
import { PaginaInterface } from '../../../shared/models/pagina/pagina-model';
import { RecensionePubblicaInterface } from '../../../shared/models/recensione/recensione-model';
import { ValutazioniInterface } from '../../../shared/models/valutazioni/valutazioni-model';
import { VotoPipe } from '../../../shared/pipes/voto-pipe';
import { SchedaRecensioneComponent } from '../scheda-recensione-component/scheda-recensione-component';

/** Recensioni caricate a ogni "mostra altre". */
const RECENSIONI_PER_PAGINA = 10;

/** Voto più alto: le barre delle medie sono in proporzione. */
const VOTO_MASSIMO = 5;

/** Medie di dettaglio mostrate sotto quella generale, nell'ordine del modulo di recensione. */
const CATEGORIE_VALUTAZIONE = [
  'media_pulizia',
  'media_personale',
  'media_posizione',
  'media_comfort',
  'media_qualita_prezzo',
] as const satisfies readonly (keyof ValutazioniInterface)[];

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
  private readonly pagina = signal(1);

  protected readonly valutazioni = rxResource({
    stream: () => this.recensioni.leggiValutazioni(),
  });
  protected readonly elenco = rxResource({
    params: () => ({ pagina: this.pagina(), perPagina: RECENSIONI_PER_PAGINA }),
    stream: ({ params }) => this.recensioni.elencaPubbliche(params),
  });

  /** Le pagine arrivate si accodano; mentre la successiva carica restano quelle già viste. */
  protected readonly mostrate = linkedSignal<
    PaginaInterface<RecensionePubblicaInterface> | undefined,
    RecensionePubblicaInterface[]
  >({
    source: () => (this.elenco.hasValue() ? this.elenco.value() : undefined),
    computation: (arrivata, precedente) => {
      const giaViste = precedente?.value ?? [];
      return arrivata ? [...giaViste, ...arrivata.elementi] : giaViste;
    },
  });

  protected readonly altre = computed(() => {
    if (!this.elenco.hasValue()) {
      return false;
    }
    const ultima = this.elenco.value();
    return ultima.pagina < ultima.pagine;
  });

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

  protected mostraAltre(): void {
    this.pagina.update((pagina) => pagina + 1);
  }

  /** Larghezza della barra: la media arriva come testo dalla vista ("4.50"). */
  protected percentuale(media: number | string): number {
    return (Number(media) / VOTO_MASSIMO) * 100;
  }
}
