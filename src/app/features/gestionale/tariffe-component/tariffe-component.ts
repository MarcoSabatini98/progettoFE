import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';

import { CamereService } from '../../../core/services/camere/camere-service';
import { CodiciScontoComponent } from '../codici-sconto-component/codici-sconto-component';
import { PacchettiComponent } from '../pacchetti-component/pacchetti-component';
import { PianiTariffariComponent } from '../piani-tariffari-component/piani-tariffari-component';
import { PromozioniComponent } from '../promozioni-component/promozioni-component';
import { StagioniComponent } from '../stagioni-component/stagioni-component';
import { TasseSoggiornoComponent } from '../tasse-soggiorno-component/tasse-soggiorno-component';

const SEZIONI = ['piani', 'stagioni', 'promozioni', 'codici', 'pacchetti', 'tasse'] as const;
type Sezione = (typeof SEZIONI)[number];

/** Listino della struttura: una linguetta per sezione, le tipologie lette una volta per tutte. */
@Component({
  selector: 'app-tariffe',
  imports: [
    TranslocoPipe,
    PianiTariffariComponent,
    StagioniComponent,
    PromozioniComponent,
    CodiciScontoComponent,
    PacchettiComponent,
    TasseSoggiornoComponent,
  ],
  templateUrl: './tariffe-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class TariffeComponent {
  private readonly camere = inject(CamereService);

  protected readonly sezioni = SEZIONI;
  protected readonly sezione = signal<Sezione>('piani');
  private readonly elencoTipologie = rxResource({ stream: () => this.camere.elencaTipologie() });
  protected readonly tipologie = computed(() =>
    this.elencoTipologie.hasValue() ? this.elencoTipologie.value() : [],
  );
}
