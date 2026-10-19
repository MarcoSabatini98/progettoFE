import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { map } from 'rxjs';

import { ErroriService } from '../../../core/services/errori/errori-service';
import { statoPagine } from '../../../core/services/api/stato-pagine';
import {
  STATI_RECENSIONE,
  VOTO_NEGATIVO,
} from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { RecensioniService } from '../../../core/services/recensioni/recensioni-service';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { StatoRecensione } from '../../../shared/models/recensione/recensione-model';
import { PaginazioneComponent } from '../../../shared/paginazione-component/paginazione-component';
import { RigaRecensioneComponent } from '../riga-recensione-component/riga-recensione-component';

/**
 * Moderazione delle recensioni: si parte da quelle in attesa, le più recenti in cima.
 * "Solo negative" trova in fretta quelle a cui conviene rispondere.
 */
@Component({
  selector: 'app-moderazione',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    CampoComponent,
    PaginazioneComponent,
    RigaRecensioneComponent,
  ],
  templateUrl: './moderazione-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class ModerazioneComponent {
  private readonly recensioni = inject(RecensioniService);
  protected readonly errori = inject(ErroriService);

  protected readonly stati = STATI_RECENSIONE;
  protected readonly filtri = inject(NonNullableFormBuilder).group({
    stato: ['in_attesa' as StatoRecensione | ''],
    negative: [false],
  });
  private readonly scelti = toSignal(
    this.filtri.valueChanges.pipe(map(() => this.filtri.getRawValue())),
    { initialValue: this.filtri.getRawValue() },
  );
  /** Cambiando i filtri si riparte dalla prima pagina. */
  protected readonly pagine = statoPagine(this.scelti);
  protected readonly elenco = rxResource({
    params: () => {
      const { stato, negative } = this.scelti();
      return {
        stato: stato || undefined,
        voto_max: negative ? VOTO_NEGATIVO : undefined,
        pagina: this.pagine.pagina(),
        perPagina: this.pagine.perPagina(),
      };
    },
    stream: ({ params }) => this.recensioni.elencaRecensioni(params),
  });
}
