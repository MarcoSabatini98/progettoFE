import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { CHIAVI_IMPOSTAZIONI } from '../../../core/services/impostazioni/impostazioni-costanti';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { RecensionePubblicaInterface } from '../../../shared/models/recensione/recensione-model';
import { DataPipe } from '../../../shared/pipes/data-pipe';
import { PaesePipe } from '../../../shared/pipes/paese-pipe';
import { VotoPipe } from '../../../shared/pipes/voto-pipe';

/** Recensione pubblicata: voto, testo, firma (o anonima) e risposta della struttura. */
@Component({
  selector: 'app-scheda-recensione',
  imports: [TranslocoPipe, IconaComponent, DataPipe, PaesePipe, VotoPipe],
  templateUrl: './scheda-recensione-component.html',
  styleUrl: './scheda-recensione-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchedaRecensioneComponent {
  private readonly impostazioni = inject(ImpostazioniService);

  readonly recensione = input.required<RecensionePubblicaInterface>();

  protected readonly struttura = computed(() => this.impostazioni.testo(CHIAVI_IMPOSTAZIONI.nome));
}
