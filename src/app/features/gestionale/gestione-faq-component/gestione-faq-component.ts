import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

import { Listino } from '../../../core/services/api/listino';
import { LIMITI_CONTENUTI } from '../../../core/services/contenuti/contenuti-costanti';
import { ContenutiService } from '../../../core/services/contenuti/contenuti-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { FaqCreaPayload, FaqInterface } from '../../../shared/models/faq/faq-model';
import { AzioniListinoComponent } from '../azioni-listino-component/azioni-listino-component';
import { ListinoComponent } from '../listino-component/listino-component';
import { TraduzioniComponent } from '../traduzioni-component/traduzioni-component';

/**
 * Domande frequenti del sito, raggruppate per categoria e messe in fila con l'ordine.
 * Una FAQ non pubblicata resta qui ma non si vede sul sito.
 */
@Component({
  selector: 'app-gestione-faq',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    CampoComponent,
    ListinoComponent,
    AzioniListinoComponent,
    TraduzioniComponent,
  ],
  templateUrl: './gestione-faq-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class GestioneFaqComponent {
  private readonly contenuti = inject(ContenutiService);
  protected readonly errori = inject(ErroriService);

  protected readonly limiti = LIMITI_CONTENUTI;
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    domanda: ['', [Validators.required, Validators.maxLength(LIMITI_CONTENUTI.domanda)]],
    risposta: ['', [Validators.required, Validators.maxLength(LIMITI_CONTENUTI.risposta)]],
    categoria: ['', Validators.maxLength(LIMITI_CONTENUTI.categoria)],
    ordine: [0, [Validators.min(0), Validators.max(LIMITI_CONTENUTI.ordine)]],
    pubblicata: [true],
  });
  protected readonly listino = new Listino<FaqInterface, FaqCreaPayload>(
    {
      elenca: () => this.contenuti.elencaFaq(),
      crea: (dati) => this.contenuti.creaFaq(dati),
      aggiorna: (id, dati) => this.contenuti.aggiornaFaq(id, dati),
      elimina: (id) => this.contenuti.eliminaFaq(id),
    },
    this.modulo,
  );
  /** Categorie già usate, proposte mentre si scrive per non crearne di quasi uguali. */
  protected readonly categorie = computed(() => {
    const faq = this.listino.elenco.hasValue() ? this.listino.elenco.value() : [];
    return [...new Set(faq.flatMap((voce) => voce.categoria ?? []))];
  });
}
