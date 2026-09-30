import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';

import { AuthService } from '../../../core/services/auth/auth-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { RUOLI } from '../../../core/services/ruoli/ruoli-costanti';
import { UtentiService } from '../../../core/services/utenti/utenti-service';
import { DatiPersonaliComponent } from '../dati-personali-component/dati-personali-component';
import { EliminaAccountComponent } from '../elimina-account-component/elimina-account-component';
import { PreferenzeEmailComponent } from '../preferenze-email-component/preferenze-email-component';
import { SicurezzaComponent } from '../sicurezza-component/sicurezza-component';
import { VerificaEmailComponent } from '../verifica-email-component/verifica-email-component';

/**
 * Account dell'utente collegato: area personale per i clienti, /staff/account per lo staff.
 * L'eliminazione dell'account è solo per i clienti.
 */
@Component({
  selector: 'app-profilo',
  imports: [
    TranslocoPipe,
    DatiPersonaliComponent,
    EliminaAccountComponent,
    PreferenzeEmailComponent,
    SicurezzaComponent,
    VerificaEmailComponent,
  ],
  templateUrl: './profilo-component.html',
  styleUrl: './profilo-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfiloComponent {
  private readonly utenti = inject(UtentiService);
  protected readonly auth = inject(AuthService);
  protected readonly errori = inject(ErroriService);

  protected readonly cliente = computed(() => this.auth.haRuolo([RUOLI.CLIENTE]));
  protected readonly profilo = rxResource({ stream: () => this.utenti.leggiProfilo() });
}
