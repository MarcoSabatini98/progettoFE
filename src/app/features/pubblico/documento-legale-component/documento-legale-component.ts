import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { ContenutiService } from '../../../core/services/contenuti/contenuti-service';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { PERCORSI_PUBBLICI } from '../../../core/services/navigazione/navigazione-costanti';
import { TIPI_DOCUMENTO_LEGALE } from '../../../core/services/sistema/sistema-costanti';

/** Privacy, termini o cookie policy in vigore, nella lingua del sito (/documenti/:tipo). */
@Component({
  selector: 'app-documento-legale',
  imports: [RouterLink, TranslocoPipe],
  templateUrl: './documento-legale-component.html',
  styleUrl: './documento-legale-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentoLegaleComponent {
  private readonly contenuti = inject(ContenutiService);
  private readonly lingua = inject(LinguaService);

  /** Tipo dal percorso: un valore sconosciuto non fa partire la chiamata. */
  readonly tipo = input.required<string>();

  protected readonly home = PERCORSI_PUBBLICI.home;
  protected readonly documento = rxResource({
    params: () => {
      const tipo = TIPI_DOCUMENTO_LEGALE.find((valido) => valido === this.tipo());
      return tipo && { tipo, lingua: this.lingua.attiva() };
    },
    stream: ({ params }) => this.contenuti.leggiDocumentoVigente(params.tipo, params.lingua),
  });
}
