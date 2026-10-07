import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { WidgetChatService } from '../../../core/services/chat/widget-chat-service';
import { CHIAVI_IMPOSTAZIONI } from '../../../core/services/impostazioni/impostazioni-costanti';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { URL_MAPPE } from '../../../core/services/navigazione/navigazione-costanti';
import { NavigazioneService } from '../../../core/services/navigazione/navigazione-service';
import { IconaComponent } from '../../../shared/icona-component/icona-component';

/**
 * Contatti (/contatti): indirizzo con il link alle mappe, email, telefono e orari,
 * tutti dalle impostazioni pubbliche. Le voci mancanti non compaiono.
 * Sotto, l'invito alla chat (non per lo staff, che risponde dal gestionale):
 * prima le domande frequenti, poi la domanda diretta.
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
  protected readonly widget = inject(WidgetChatService);
  protected readonly navigazione = inject(NavigazioneService);

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
