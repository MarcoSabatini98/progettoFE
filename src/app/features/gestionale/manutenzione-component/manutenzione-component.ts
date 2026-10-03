import { ChangeDetectionStrategy, Component, inject, linkedSignal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { map } from 'rxjs';

import { AuthService } from '../../../core/services/auth/auth-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { ManutenzioneService } from '../../../core/services/manutenzione/manutenzione-service';
import { PRIORITA, STATI_SEGNALAZIONE } from '../../../core/services/pulizie/pulizie-costanti';
import { PERMESSI } from '../../../core/services/ruoli/ruoli-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { Priorita } from '../../../shared/models/attivita-pulizia/attivita-pulizia-model';
import {
  FiltriSegnalazioni,
  StatoSegnalazione,
} from '../../../shared/models/segnalazione-manutenzione/segnalazione-manutenzione-model';
import { PaginazioneComponent } from '../../../shared/paginazione-component/paginazione-component';
import { NuovaSegnalazioneComponent } from '../nuova-segnalazione-component/nuova-segnalazione-component';
import { RigaSegnalazioneComponent } from '../riga-segnalazione-component/riga-segnalazione-component';

const SEGNALAZIONI_PER_PAGINA = 20;

/** Le aperte (aperta o in corso), tutte, o un solo stato. */
type Vista = 'aperte' | 'tutte' | StatoSegnalazione;

function filtroVista(vista: Vista): FiltriSegnalazioni {
  if (vista === 'tutte') return {};
  return vista === 'aperte' ? { aperte: true } : { stato: vista };
}

/**
 * Guasti segnalati dallo staff, i più urgenti in cima. Chi non gestisce la manutenzione
 * vede solo quelli che ha segnalato o che gli sono assegnati (lo decide il backend).
 */
@Component({
  selector: 'app-manutenzione',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    CampoComponent,
    NuovaSegnalazioneComponent,
    PaginazioneComponent,
    RigaSegnalazioneComponent,
  ],
  templateUrl: './manutenzione-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class ManutenzioneComponent {
  private readonly manutenzione = inject(ManutenzioneService);
  protected readonly errori = inject(ErroriService);

  protected readonly gestore = inject(AuthService).haPermessi([PERMESSI.MANUTENZIONE_GESTISCI]);
  protected readonly stati = STATI_SEGNALAZIONE;
  protected readonly priorita = PRIORITA;
  protected readonly filtri = inject(NonNullableFormBuilder).group({
    vista: ['aperte' as Vista],
    priorita: ['' as Priorita | ''],
    mie: [false],
  });
  private readonly scelti = toSignal(
    this.filtri.valueChanges.pipe(map(() => this.filtri.getRawValue())),
    { initialValue: this.filtri.getRawValue() },
  );
  /** Cambiando i filtri si riparte dalla prima pagina. */
  protected readonly pagina = linkedSignal({ source: this.scelti, computation: () => 1 });
  protected readonly elenco = rxResource({
    params: () => {
      const { vista, priorita, mie } = this.scelti();
      return {
        ...filtroVista(vista),
        priorita: priorita || undefined,
        mie: mie || undefined,
        pagina: this.pagina(),
        perPagina: SEGNALAZIONI_PER_PAGINA,
      };
    },
    stream: ({ params }) => this.manutenzione.elencaSegnalazioni(params),
  });

  /**
   * SFOGLIA
   * Avanti o indietro di una pagina.
   */
  sfoglia(passo: number): void {
    this.pagina.update((numero) => numero + passo);
  }
}
