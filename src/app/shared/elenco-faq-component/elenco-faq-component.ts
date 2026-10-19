import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';

import { ContenutiService } from '../../core/services/contenuti/contenuti-service';
import { LinguaService } from '../../core/services/lingua/lingua-service';
import { IconaComponent } from '../icona-component/icona-component';
import { FaqInterface } from '../models/faq/faq-model';

/**
 * Domande frequenti nella lingua attiva, raggruppate per categoria nell'ordine
 * in cui arrivano: un clic sulla domanda apre la risposta.
 * Nella pagina /faq e nel widget della chat.
 */
@Component({
  selector: 'app-elenco-faq',
  imports: [TranslocoPipe, IconaComponent],
  templateUrl: './elenco-faq-component.html',
  styleUrl: './elenco-faq-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ElencoFaqComponent {
  private readonly contenuti = inject(ContenutiService);
  private readonly lingua = inject(LinguaService);

  /** Livello del titolo delle categorie, sotto il titolo di chi ospita l'elenco. */
  readonly livello = input(2);

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
