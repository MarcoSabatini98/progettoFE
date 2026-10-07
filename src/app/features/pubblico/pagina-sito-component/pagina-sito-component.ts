import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';

import { ContenutiService } from '../../../core/services/contenuti/contenuti-service';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { ChiavePagina } from '../../../shared/models/pagina-sito/pagina-sito-model';
import { MediaPipe } from '../../../shared/pipes/media-pipe';
import { ScorriComponent } from '../scorri-component/scorri-component';
import { SezioniComponent } from '../sezioni-component/sezioni-component';

/**
 * Pagina del sito scritta dallo staff (struttura, attività): copertina a tutto schermo
 * con titolo e descrizione, poi le sezioni immagine-testo alternate.
 * Senza copertina resta un'intestazione normale; senza sezioni, l'avviso che arrivano.
 */
@Component({
  selector: 'app-pagina-sito',
  imports: [TranslocoPipe, MediaPipe, ScorriComponent, SezioniComponent],
  templateUrl: './pagina-sito-component.html',
  styleUrl: './pagina-sito-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class PaginaSitoComponent {
  private readonly contenuti = inject(ContenutiService);
  private readonly lingua = inject(LinguaService);

  /** Anche la chiave dei testi fissi: occhiello, titolo e introduzione. */
  readonly chiave = input.required<Exclude<ChiavePagina, 'home'>>();

  protected readonly pagina = rxResource({
    params: () => ({ chiave: this.chiave(), lingua: this.lingua.attiva() }),
    stream: ({ params }) => this.contenuti.leggiPaginaPubblica(params.chiave, params.lingua),
  });
  private readonly dati = computed(() =>
    this.pagina.hasValue() ? this.pagina.value() : undefined,
  );
  protected readonly copertina = computed(() => this.dati()?.media?.[0]);
  protected readonly descrizione = computed(() => this.dati()?.descrizione);
  protected readonly sezioni = computed(() => this.dati()?.sezioni ?? []);
}
