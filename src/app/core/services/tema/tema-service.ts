import { DOCUMENT, Injectable, computed, effect, inject, signal } from '@angular/core';

import { PreferenzaTema } from '../../../shared/models/tema/tema-model';
import { CHIAVI_ARCHIVIO } from '../archivio/archivio-costanti';
import { ArchivioService } from '../archivio/archivio-service';
import { CHIAVI_IMPOSTAZIONI } from '../impostazioni/impostazioni-costanti';
import { ImpostazioniService } from '../impostazioni/impostazioni-service';
import {
  ATTRIBUTO_TEMA,
  COLORE_ESADECIMALE,
  PREFERENZE_TEMA,
  SOGLIA_BRAND_CHIARO,
  TESTO_SU_BRAND,
} from './tema-costanti';

/**
 * TESTO SU BRAND
 * Bianco sui colori scuri, scuro sui chiari: luminosità percepita del colore #rrggbb.
 */
export function testoSuBrand(colore: string): string {
  const [rosso, verde, blu] = [1, 3, 5].map((inizio) =>
    parseInt(colore.slice(inizio, inizio + 2), 16),
  );
  const luminosita = (0.299 * rosso + 0.587 * verde + 0.114 * blu) / 255;
  return luminosita > SOGLIA_BRAND_CHIARO ? TESTO_SU_BRAND.scuro : TESTO_SU_BRAND.chiaro;
}

@Injectable({
  providedIn: 'root',
})
export class TemaService {
  private readonly archivio = inject(ArchivioService);
  private readonly impostazioni = inject(ImpostazioniService);
  private readonly radice = inject(DOCUMENT).documentElement;
  private readonly sceltaLocale = signal<PreferenzaTema | null>(
    this.archivio.leggi(CHIAVI_ARCHIVIO.tema, PREFERENZE_TEMA),
  );

  /** Tema predefinito della struttura, se valido. */
  private readonly predefinita = computed(() => {
    const valore = this.impostazioni.testo(CHIAVI_IMPOSTAZIONI.tema);
    return PREFERENZE_TEMA.find((preferenza) => preferenza === valore) ?? null;
  });

  /** Colore principale della struttura, se valido. */
  private readonly brand = computed(() => {
    const colore = this.impostazioni.testo(CHIAVI_IMPOSTAZIONI.colore);
    return COLORE_ESADECIMALE.test(colore) ? colore : null;
  });

  /**
   * Tema scelto. Priorità: localStorage → impostazione della struttura → "sistema" (segue il dispositivo).
   */
  readonly preferenza = computed(() => this.sceltaLocale() ?? this.predefinita() ?? 'sistema');

  constructor() {
    effect(() => this.applica(this.preferenza()));
    effect(() => this.applicaBrand(this.brand()));
  }

  /**
   * IMPOSTA
   * Salva la scelta sul dispositivo: vale più del tema della struttura.
   */
  imposta(preferenza: PreferenzaTema): void {
    this.sceltaLocale.set(preferenza);
    this.archivio.scrivi(CHIAVI_ARCHIVIO.tema, preferenza);
  }

  /**
   * Con "sistema" l'attributo viene tolto e decide color-scheme del dispositivo;
   * altrimenti l'attributo forza chiaro o scuro (vedi src/styles/token.css).
   */
  private applica(preferenza: PreferenzaTema): void {
    if (preferenza === 'sistema') {
      this.radice.removeAttribute(ATTRIBUTO_TEMA);
    } else {
      this.radice.setAttribute(ATTRIBUTO_TEMA, preferenza);
    }
  }

  /**
   * Il colore della struttura sovrascrive --bb-brand; senza colore resta quello di token.css.
   */
  private applicaBrand(colore: string | null): void {
    if (colore) {
      this.radice.style.setProperty('--bb-brand', colore);
      this.radice.style.setProperty('--bb-su-brand', testoSuBrand(colore));
    } else {
      this.radice.style.removeProperty('--bb-brand');
      this.radice.style.removeProperty('--bb-su-brand');
    }
  }
}
