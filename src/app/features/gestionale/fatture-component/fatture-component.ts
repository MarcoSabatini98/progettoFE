import { ChangeDetectionStrategy, Component, inject, linkedSignal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { debounceTime, map } from 'rxjs';

import { ATTESA_RICERCA_MS } from '../../../core/services/api/api-costanti';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { FattureService } from '../../../core/services/fatture/fatture-service';
import { STATI_SDI } from '../../../core/services/pagamenti/pagamenti-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { FiltriFatture, StatoSdi } from '../../../shared/models/fattura/fattura-model';
import { PaginazioneComponent } from '../../../shared/paginazione-component/paginazione-component';
import { RigaFatturaComponent } from '../riga-fattura-component/riga-fattura-component';

const FATTURE_PER_PAGINA = 20;
/** L'anno parte solo intero: mentre si scrive "202" non si cerca. */
const ANNO_COMPLETO = /^\d{4}$/;

/**
 * Fatture e note di credito, le più recenti in cima, cercate per intestatario e filtrate
 * per stato SDI e anno. Le bozze nascono dalla scheda della prenotazione.
 */
@Component({
  selector: 'app-fatture',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    CampoComponent,
    PaginazioneComponent,
    RigaFatturaComponent,
  ],
  templateUrl: './fatture-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class FattureComponent {
  private readonly fatture = inject(FattureService);
  protected readonly errori = inject(ErroriService);

  protected readonly stati = STATI_SDI;
  protected readonly filtri = inject(NonNullableFormBuilder).group({
    cerca: '',
    stato: '' as StatoSdi | '',
    anno: null as number | null,
  });
  private readonly scelti = toSignal(
    this.filtri.valueChanges.pipe(
      debounceTime(ATTESA_RICERCA_MS),
      map(() => this.filtri.getRawValue()),
    ),
    { initialValue: this.filtri.getRawValue() },
  );
  /** Cambiando i filtri si riparte dalla prima pagina. */
  protected readonly pagina = linkedSignal({ source: this.scelti, computation: () => 1 });
  protected readonly elenco = rxResource({
    params: () => this.parametri(),
    stream: ({ params }) => this.fatture.elencaFatture(params),
  });

  /**
   * SFOGLIA
   * Avanti o indietro di una pagina.
   */
  sfoglia(passo: number): void {
    this.pagina.update((numero) => numero + passo);
  }

  private parametri(): FiltriFatture {
    const { cerca, stato, anno } = this.scelti();
    return {
      cerca: cerca.trim() || undefined,
      stato_sdi: stato ? [stato] : [],
      anno: ANNO_COMPLETO.test(String(anno)) ? Number(anno) : undefined,
      pagina: this.pagina(),
      perPagina: FATTURE_PER_PAGINA,
    };
  }
}
