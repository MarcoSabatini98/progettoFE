import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';

import { FOTO_SITO } from '../../../core/services/contenuti/contenuti-costanti';
import { ContenutiService } from '../../../core/services/contenuti/contenuti-service';
import { DocumentiLegaliComponent } from '../documenti-legali-component/documenti-legali-component';
import { EventiComponent } from '../eventi-component/eventi-component';
import { GalleriaMediaComponent } from '../galleria-media-component/galleria-media-component';
import { GestionePagineComponent } from '../gestione-pagine-component/gestione-pagine-component';

const SEZIONI = ['foto', 'pagine', 'documenti', 'eventi'] as const;
type Sezione = (typeof SEZIONI)[number];

/**
 * Contenuti del sito: foto della struttura, pagine (home, struttura, attività), documenti legali,
 * eventi in zona.
 * Le traduzioni stanno nella scheda di ogni record (pacchetti, promozioni, tipologie).
 */
@Component({
  selector: 'app-contenuti',
  imports: [
    TranslocoPipe,
    GalleriaMediaComponent,
    GestionePagineComponent,
    DocumentiLegaliComponent,
    EventiComponent,
  ],
  templateUrl: './contenuti-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class ContenutiComponent {
  private readonly contenuti = inject(ContenutiService);

  protected readonly sezioni = SEZIONI;
  protected readonly sezione = signal<Sezione>('foto');
  protected readonly gallerie = FOTO_SITO.map((entita) => ({
    entita,
    media: rxResource({ stream: () => this.contenuti.elencaMedia({ entita }) }),
  }));
}
