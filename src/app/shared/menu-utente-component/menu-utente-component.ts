import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@angular/aria/menu';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AuthService } from '../../core/services/auth/auth-service';
import {
  PERCORSI_PUBBLICI,
  PERCORSO_STAFF,
} from '../../core/services/navigazione/navigazione-costanti';
import { NavigazioneService } from '../../core/services/navigazione/navigazione-service';
import { VoceMenuInterface } from '../models/voce-menu/voce-menu-model';
import { IconaComponent } from '../icona-component/icona-component';
import { InizialiPipe } from '../pipes/iniziali-pipe';

/** Valore della voce "Esci": le altre voci hanno come valore il percorso da aprire. */
const VALORE_ESCI = 'esci';

/**
 * Avatar dell'utente collegato con il menu del suo account: cambio area ed uscita.
 */
@Component({
  selector: 'app-menu-utente',
  imports: [Menu, MenuContent, MenuItem, MenuTrigger, TranslocoPipe, IconaComponent, InizialiPipe],
  templateUrl: './menu-utente-component.html',
  styleUrl: './menu-utente-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuUtenteComponent {
  private readonly router = inject(Router);
  private readonly navigazione = inject(NavigazioneService);
  protected readonly auth = inject(AuthService);
  protected readonly valoreEsci = VALORE_ESCI;

  /** Area in cui si trova il menu: dallo staff si torna al sito e viceversa. */
  readonly area = input.required<'pubblica' | 'staff'>();

  protected readonly destinazione = computed<VoceMenuInterface>(() => {
    if (this.area() === 'staff') {
      return {
        etichetta: 'menu.utente.sito',
        percorso: PERCORSI_PUBBLICI.home,
        icona: 'storefront',
      };
    }
    return this.navigazione.staff()
      ? { etichetta: 'menu.utente.gestionale', percorso: PERCORSO_STAFF, icona: 'dashboard' }
      : {
          etichetta: 'menu.utente.personale',
          percorso: PERCORSI_PUBBLICI.areaPersonale,
          icona: 'person',
        };
  });

  protected scegli(valore: string): void {
    if (valore === VALORE_ESCI) {
      this.esci();
    } else {
      void this.router.navigateByUrl(valore);
    }
  }

  // La sessione locale si chiude anche se la chiamata fallisce: si torna al sito in entrambi i casi.
  private esci(): void {
    const torna = () => void this.router.navigateByUrl(PERCORSI_PUBBLICI.home);
    this.auth.esci().subscribe({ complete: torna, error: torna });
  }
}
