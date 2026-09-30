import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { ContenutiService } from '../../../core/services/contenuti/contenuti-service';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { PERCORSI_PUBBLICI } from '../../../core/services/navigazione/navigazione-costanti';
import { FaqInterface } from '../../../shared/models/faq/faq-model';
import { IconaComponent } from '../../../shared/icona-component/icona-component';

/**
 * Domande frequenti (/faq), raggruppate per categoria nell'ordine in cui arrivano.
 * In fondo il rimando ai contatti per le domande che mancano.
 */
@Component({
  selector: 'app-faq',
  imports: [RouterLink, TranslocoPipe, IconaComponent],
  templateUrl: './faq-component.html',
  styleUrl: './faq-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class FaqComponent {
  private readonly contenuti = inject(ContenutiService);
  private readonly lingua = inject(LinguaService);

  protected readonly contatti = PERCORSI_PUBBLICI.contatti;
  protected readonly faq = rxResource({
    params: () => this.lingua.attiva(),
    stream: ({ params }) => this.contenuti.elencaFaqPubbliche(params),
  });

  /** Le domande senza categoria formano un gruppo senza titolo. */
  protected readonly gruppi = computed(() => {
    const gruppi = new Map<string | null, FaqInterface[]>();
    for (const domanda of this.faq.hasValue() ? this.faq.value() : []) {
      gruppi.set(domanda.categoria, [...(gruppi.get(domanda.categoria) ?? []), domanda]);
    }
    return [...gruppi].map(([categoria, domande]) => ({ categoria, domande }));
  });
}
