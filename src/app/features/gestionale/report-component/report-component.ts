import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { filter, map } from 'rxjs';

import { ANNO_COMPLETO } from '../../../core/services/api/api-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IncassiAnnoComponent } from '../incassi-anno-component/incassi-anno-component';
import { SuggerimentiPrezzoComponent } from '../suggerimenti-prezzo-component/suggerimenti-prezzo-component';
import { TassaSoggiornoAnnoComponent } from '../tassa-soggiorno-anno-component/tassa-soggiorno-anno-component';

/**
 * Report della direzione: i prezzi suggeriti per i prossimi giorni e i conti
 * di un anno (incassi per metodo, imposta di soggiorno da dichiarare).
 * L'andamento di un periodo, col PDF, sta nel cruscotto.
 */
@Component({
  selector: 'app-report',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    CampoComponent,
    IncassiAnnoComponent,
    SuggerimentiPrezzoComponent,
    TassaSoggiornoAnnoComponent,
  ],
  templateUrl: './report-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class ReportComponent {
  private readonly annoCorrente = new Date().getFullYear();

  protected readonly campoAnno = inject(NonNullableFormBuilder).control(this.annoCorrente);
  /** Cambia solo con un anno intero: mentre si scrive "202" restano i conti di prima. */
  protected readonly anno = toSignal(
    this.campoAnno.valueChanges.pipe(
      filter((anno) => ANNO_COMPLETO.test(String(anno))),
      map(Number),
    ),
    { initialValue: this.annoCorrente },
  );
}
