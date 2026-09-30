import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { CHIAVI_IMPOSTAZIONI } from '../../../core/services/impostazioni/impostazioni-costanti';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { URL_MAPPE } from '../../../core/services/navigazione/navigazione-costanti';
import { IconaComponent } from '../../../shared/icona-component/icona-component';

/**
 * Contatti (/contatti): indirizzo con il link alle mappe, email, telefono e orari,
 * tutti dalle impostazioni pubbliche. Le voci mancanti non compaiono.
 */
@Component({
  selector: 'app-contatti',
  imports: [TranslocoPipe, IconaComponent],
  templateUrl: './contatti-component.html',
  styleUrl: './contatti-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class ContattiComponent {
  private readonly impostazioni = inject(ImpostazioniService);

  protected readonly indirizzo = this.impostazioni.indirizzo;
  protected readonly mappa = computed(() => URL_MAPPE + encodeURIComponent(this.indirizzo()));
  protected readonly email = computed(() => this.impostazioni.testo(CHIAVI_IMPOSTAZIONI.email));
  protected readonly telefono = computed(() =>
    this.impostazioni.testo(CHIAVI_IMPOSTAZIONI.telefono),
  );
  protected readonly checkin = computed(() =>
    this.impostazioni.testo(CHIAVI_IMPOSTAZIONI.orarioCheckin),
  );
  protected readonly checkout = computed(() =>
    this.impostazioni.testo(CHIAVI_IMPOSTAZIONI.orarioCheckout),
  );
}
