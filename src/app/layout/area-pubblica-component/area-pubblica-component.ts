import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AuthService } from '../../core/services/auth/auth-service';
import { CHIAVI_IMPOSTAZIONI } from '../../core/services/impostazioni/impostazioni-costanti';
import { ImpostazioniService } from '../../core/services/impostazioni/impostazioni-service';
import { PERCORSI_PUBBLICI } from '../../core/services/navigazione/navigazione-costanti';
import { TIPI_DOCUMENTO_LEGALE } from '../../core/services/sistema/sistema-costanti';
import { IconaComponent } from '../../shared/icona-component/icona-component';
import { MenuUtenteComponent } from '../../shared/menu-utente-component/menu-utente-component';
import { InizialiPipe } from '../../shared/pipes/iniziali-pipe';
import { SelettoreLinguaComponent } from '../../shared/selettore-lingua-component/selettore-lingua-component';
import { SelettoreTemaComponent } from '../../shared/selettore-tema-component/selettore-tema-component';

/**
 * Guscio del sito pubblico e del portale cliente: testata, contenuto, piè di pagina
 * con i dati obbligatori della struttura (indirizzo, contatti, CIN).
 */
@Component({
  selector: 'app-area-pubblica',
  imports: [
    RouterLink,
    RouterOutlet,
    TranslocoPipe,
    IconaComponent,
    InizialiPipe,
    MenuUtenteComponent,
    SelettoreLinguaComponent,
    SelettoreTemaComponent,
  ],
  templateUrl: './area-pubblica-component.html',
  styleUrl: './area-pubblica-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'area-pubblica' },
})
export class AreaPubblicaComponent {
  private readonly impostazioni = inject(ImpostazioniService);
  protected readonly auth = inject(AuthService);
  protected readonly percorsi = PERCORSI_PUBBLICI;
  protected readonly documentiLegali = TIPI_DOCUMENTO_LEGALE;

  protected readonly nome = computed(() => this.impostazioni.testo(CHIAVI_IMPOSTAZIONI.nome));
  protected readonly email = computed(() => this.impostazioni.testo(CHIAVI_IMPOSTAZIONI.email));
  protected readonly telefono = computed(() =>
    this.impostazioni.testo(CHIAVI_IMPOSTAZIONI.telefono),
  );
  protected readonly cin = computed(() => this.impostazioni.testo(CHIAVI_IMPOSTAZIONI.cin));

  /** "Via Roma 1, 07100 Sassari (SS)": le parti mancanti vengono saltate. */
  protected readonly indirizzo = computed(() => {
    const testo = (chiave: string) => this.impostazioni.testo(chiave);
    const provincia = testo(CHIAVI_IMPOSTAZIONI.provincia);
    const localita = [
      testo(CHIAVI_IMPOSTAZIONI.cap),
      testo(CHIAVI_IMPOSTAZIONI.comune),
      provincia && `(${provincia})`,
    ]
      .filter(Boolean)
      .join(' ');
    return [testo(CHIAVI_IMPOSTAZIONI.indirizzo), localita].filter(Boolean).join(', ');
  });
}
