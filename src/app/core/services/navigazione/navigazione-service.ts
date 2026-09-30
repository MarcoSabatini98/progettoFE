import { Injectable, computed, inject } from '@angular/core';

import { GruppoMenuInterface } from '../../../shared/models/voce-menu/voce-menu-model';
import { AuthService } from '../auth/auth-service';
import { RUOLI_STAFF } from '../ruoli/ruoli-costanti';
import { MENU_STAFF, PERCORSI_PUBBLICI, PERCORSO_STAFF } from './navigazione-costanti';

/**
 * Menu e percorsi che dipendono da chi è collegato.
 */
@Injectable({
  providedIn: 'root',
})
export class NavigazioneService {
  private readonly auth = inject(AuthService);

  /** true se l'utente collegato entra nell'area staff. */
  readonly staff = computed(() => this.auth.haRuolo(RUOLI_STAFF));

  /** Menu staff con le sole voci permesse; i gruppi rimasti vuoti spariscono. */
  readonly menuStaff = computed<GruppoMenuInterface[]>(() =>
    MENU_STAFF.map((gruppo) => ({
      ...gruppo,
      voci: gruppo.voci.filter((voce) => this.auth.puoAccedere(voce)),
    })).filter((gruppo) => gruppo.voci.length > 0),
  );

  /** Prima pagina staff permessa: dove porta /staff. */
  readonly primaPaginaStaff = computed(
    () => this.menuStaff()[0]?.voci[0]?.percorso ?? PERCORSI_PUBBLICI.home,
  );

  /** Dopo l'accesso: lo staff va al gestionale, i clienti restano sul sito. */
  readonly paginaIniziale = computed(() =>
    this.staff() ? PERCORSO_STAFF : PERCORSI_PUBBLICI.home,
  );
}
