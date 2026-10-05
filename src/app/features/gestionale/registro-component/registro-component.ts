import { ChangeDetectionStrategy, Component, inject, linkedSignal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { map } from 'rxjs';

import { giornoDopo } from '../../../core/services/disponibilita/date-soggiorno';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { RegistroService } from '../../../core/services/registro/registro-service';
import { AZIONI_REGISTRO, TABELLE_REGISTRO } from '../../../core/services/sistema/sistema-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import {
  AzioneRegistro,
  FiltriRegistro,
  TabellaRegistro,
} from '../../../shared/models/registro-attivita/registro-attivita-model';
import { PaginazioneComponent } from '../../../shared/paginazione-component/paginazione-component';
import { RigaRegistroComponent } from '../riga-registro-component/riga-registro-component';

const ATTIVITA_PER_PAGINA = 20;

/**
 * Chi ha cambiato cosa in prenotazioni, pagamenti e fatture, le modifiche più recenti in cima,
 * filtrate per tabella, azione e periodo. Solo per l'admin.
 */
@Component({
  selector: 'app-registro',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    CampoComponent,
    PaginazioneComponent,
    RigaRegistroComponent,
  ],
  templateUrl: './registro-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class RegistroComponent {
  private readonly registro = inject(RegistroService);
  protected readonly errori = inject(ErroriService);

  protected readonly scelte = { tabelle: TABELLE_REGISTRO, azioni: AZIONI_REGISTRO };
  protected readonly filtri = inject(NonNullableFormBuilder).group({
    tabella: '' as TabellaRegistro | '',
    azione: '' as AzioneRegistro | '',
    dal: '',
    al: '',
  });
  private readonly scelti = toSignal(
    this.filtri.valueChanges.pipe(map(() => this.filtri.getRawValue())),
    { initialValue: this.filtri.getRawValue() },
  );
  /** Cambiando i filtri si riparte dalla prima pagina. */
  protected readonly pagina = linkedSignal({ source: this.scelti, computation: () => 1 });
  protected readonly elenco = rxResource({
    params: () => this.parametri(),
    stream: ({ params }) => this.registro.elencaAttivita(params),
  });

  /**
   * SFOGLIA
   * Avanti o indietro di una pagina.
   */
  sfoglia(passo: number): void {
    this.pagina.update((numero) => numero + passo);
  }

  // Il backend esclude il giorno «al»: per chi sceglie le date è compreso.
  private parametri(): FiltriRegistro {
    const { tabella, azione, dal, al } = this.scelti();
    return {
      tabella: tabella || undefined,
      azione: azione || undefined,
      dal: dal || undefined,
      al: al ? giornoDopo(al) : undefined,
      pagina: this.pagina(),
      perPagina: ATTIVITA_PER_PAGINA,
    };
  }
}
