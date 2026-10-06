import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';

import { AuthService } from '../../../core/services/auth/auth-service';
import { SFONDI_HOME } from '../../../core/services/contenuti/contenuti-costanti';
import { ContenutiService } from '../../../core/services/contenuti/contenuti-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import {
  GRUPPO_IMMAGINI,
  ORDINE_GRUPPI_IMPOSTAZIONI,
  ORDINE_VOCI_IMPOSTAZIONI,
} from '../../../core/services/impostazioni/impostazioni-costanti';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { PERMESSI } from '../../../core/services/ruoli/ruoli-costanti';
import { ImpostazioneInterface } from '../../../shared/models/impostazione/impostazione-model';
import { GalleriaMediaComponent } from '../galleria-media-component/galleria-media-component';
import { GruppoImpostazioniComponent } from '../gruppo-impostazioni-component/gruppo-impostazioni-component';

/** Posizione nell'elenco; chi non c'è va in fondo. */
const posizione = (elenco: readonly string[], valore: string) => {
  const indice = elenco.indexOf(valore);
  return indice < 0 ? elenco.length : indice;
};

/**
 * Impostazioni della struttura, un modulo per gruppo, logo e sfondo della home.
 * Dopo ogni salvataggio il sito rilegge le pubbliche: nome, colore e tema cambiano subito.
 */
@Component({
  selector: 'app-impostazioni',
  imports: [TranslocoPipe, GalleriaMediaComponent, GruppoImpostazioniComponent],
  templateUrl: './impostazioni-component.html',
  styleUrl: './impostazioni-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class ImpostazioniComponent {
  private readonly impostazioni = inject(ImpostazioniService);
  private readonly contenuti = inject(ContenutiService);
  protected readonly errori = inject(ErroriService);

  /** Logo e sfondo sono media del sito: serve anche il permesso sui contenuti. */
  protected readonly puoImmagini = inject(AuthService).haPermessi([PERMESSI.CONTENUTI_GESTISCI]);
  protected readonly elenco = rxResource({
    stream: () => this.impostazioni.elencaImpostazioni(),
  });
  protected readonly logo = rxResource({
    params: () => this.puoImmagini || undefined,
    stream: () => this.contenuti.elencaMedia({ entita: 'logo' }),
  });
  /** Foto o video a tutto schermo dietro la copertina della home: uno per tema. */
  protected readonly sfondi = Object.values(SFONDI_HOME).map((entita) => ({
    entita,
    media: rxResource({
      params: () => this.puoImmagini || undefined,
      stream: () => this.contenuti.elencaMedia({ entita }),
    }),
  }));

  protected readonly gruppoImmagini = GRUPPO_IMMAGINI;

  /** Gruppi e voci nell'ordine del gestionale, non in quello alfabetico del backend. */
  protected readonly gruppi = computed(() => {
    const voci = [...(this.elenco.hasValue() ? this.elenco.value() : [])].sort(
      (a, b) =>
        posizione(ORDINE_GRUPPI_IMPOSTAZIONI, a.gruppo) -
          posizione(ORDINE_GRUPPI_IMPOSTAZIONI, b.gruppo) ||
        posizione(ORDINE_VOCI_IMPOSTAZIONI, a.chiave) -
          posizione(ORDINE_VOCI_IMPOSTAZIONI, b.chiave),
    );
    const gruppi = new Map<string, ImpostazioneInterface[]>();
    for (const voce of voci) {
      gruppi.set(voce.gruppo, [...(gruppi.get(voce.gruppo) ?? []), voce]);
    }
    return [...gruppi].map(([nome, voci]) => ({ nome, voci }));
  });

  /**
   * AGGIORNA SITO
   * Rilegge le pubbliche: nome, colore, tema e logo cambiano subito.
   */
  aggiornaSito(): void {
    this.impostazioni.leggiPubbliche().subscribe();
  }

  /**
   * LOGO CAMBIATO
   */
  logoCambiato(): void {
    this.logo.reload();
    this.aggiornaSito();
  }
}
