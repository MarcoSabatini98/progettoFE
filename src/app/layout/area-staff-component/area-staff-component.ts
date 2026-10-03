import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { PresenzeService } from '../../core/services/chat/presenze-service';
import { CHIAVI_IMPOSTAZIONI } from '../../core/services/impostazioni/impostazioni-costanti';
import { ImpostazioniService } from '../../core/services/impostazioni/impostazioni-service';
import { PERCORSO_STAFF } from '../../core/services/navigazione/navigazione-costanti';
import { NavigazioneService } from '../../core/services/navigazione/navigazione-service';
import { IconaComponent } from '../../shared/icona-component/icona-component';
import { MenuUtenteComponent } from '../../shared/menu-utente-component/menu-utente-component';
import { SelettoreLinguaComponent } from '../../shared/selettore-lingua-component/selettore-lingua-component';
import { SelettoreTemaComponent } from '../../shared/selettore-tema-component/selettore-tema-component';
import { chiudiPopover } from '../chiudi-popover';

/**
 * Guscio del gestionale. Il menu è un popover nativo: su mobile si apre dalla barra
 * come cassetto (Esc e tocco fuori lo chiudono), da desktop è sempre visibile a sinistra.
 */
@Component({
  selector: 'app-area-staff',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    TranslocoPipe,
    IconaComponent,
    MenuUtenteComponent,
    SelettoreLinguaComponent,
    SelettoreTemaComponent,
  ],
  templateUrl: './area-staff-component.html',
  styleUrl: './area-staff-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'area-gestionale' },
})
export class AreaStaffComponent {
  private readonly impostazioni = inject(ImpostazioniService);
  protected readonly navigazione = inject(NavigazioneService);
  protected readonly percorsoStaff = PERCORSO_STAFF;
  protected readonly nome = computed(() => this.impostazioni.testo(CHIAVI_IMPOSTAZIONI.nome));
  protected readonly chiudiMenu = chiudiPopover;

  constructor() {
    // Collega il socket all'ingresso: si risulta online in tutto il gestionale, non solo in chat.
    inject(PresenzeService);
  }
}
