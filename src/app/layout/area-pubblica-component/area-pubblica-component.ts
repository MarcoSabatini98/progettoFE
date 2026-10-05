import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AuthService } from '../../core/services/auth/auth-service';
import { CHIAVI_IMPOSTAZIONI } from '../../core/services/impostazioni/impostazioni-costanti';
import { ImpostazioniService } from '../../core/services/impostazioni/impostazioni-service';
import {
  MENU_PUBBLICO,
  PERCORSI_PUBBLICI,
} from '../../core/services/navigazione/navigazione-costanti';
import { NavigazioneService } from '../../core/services/navigazione/navigazione-service';
import { TIPI_DOCUMENTO_LEGALE } from '../../core/services/sistema/sistema-costanti';
import { IconaComponent } from '../../shared/icona-component/icona-component';
import { MenuUtenteComponent } from '../../shared/menu-utente-component/menu-utente-component';
import { InizialiPipe } from '../../shared/pipes/iniziali-pipe';
import { MediaPipe } from '../../shared/pipes/media-pipe';
import { SelettoreLinguaComponent } from '../../shared/selettore-lingua-component/selettore-lingua-component';
import { SelettoreTemaComponent } from '../../shared/selettore-tema-component/selettore-tema-component';
import { chiudiPopover } from '../chiudi-popover';
import { WidgetChatComponent } from '../widget-chat-component/widget-chat-component';

/**
 * Guscio del sito pubblico e del portale cliente: testata con il menu del sito
 * (a cassetto da mobile, in riga da desktop), contenuto, piè di pagina
 * con i dati obbligatori della struttura (indirizzo, contatti, CIN) e la chat
 * di assistenza per visitatori e clienti (lo staff risponde dal gestionale).
 */
@Component({
  selector: 'app-area-pubblica',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    TranslocoPipe,
    IconaComponent,
    InizialiPipe,
    MenuUtenteComponent,
    SelettoreLinguaComponent,
    SelettoreTemaComponent,
    MediaPipe,
    WidgetChatComponent,
  ],
  templateUrl: './area-pubblica-component.html',
  styleUrl: './area-pubblica-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'area-pubblica' },
})
export class AreaPubblicaComponent {
  private readonly impostazioni = inject(ImpostazioniService);
  protected readonly auth = inject(AuthService);
  protected readonly navigazione = inject(NavigazioneService);
  protected readonly percorsi = PERCORSI_PUBBLICI;
  protected readonly documentiLegali = TIPI_DOCUMENTO_LEGALE;
  protected readonly menuSito = MENU_PUBBLICO;
  protected readonly chiudiMenu = chiudiPopover;

  protected readonly nome = computed(() => this.impostazioni.testo(CHIAVI_IMPOSTAZIONI.nome));
  protected readonly logo = computed(() => this.impostazioni.testo(CHIAVI_IMPOSTAZIONI.logo));
  protected readonly email = computed(() => this.impostazioni.testo(CHIAVI_IMPOSTAZIONI.email));
  protected readonly telefono = computed(() =>
    this.impostazioni.testo(CHIAVI_IMPOSTAZIONI.telefono),
  );
  protected readonly cin = computed(() => this.impostazioni.testo(CHIAVI_IMPOSTAZIONI.cin));
  protected readonly indirizzo = this.impostazioni.indirizzo;
}
