import { DOCUMENT, Injectable, computed, effect, inject, signal } from '@angular/core';

import { PreferenzaTema } from '../../../shared/models/tema/tema-model';
import { InizialiPipe } from '../../../shared/pipes/iniziali-pipe';
import { MediaPipe } from '../../../shared/pipes/media-pipe';
import { CHIAVI_ARCHIVIO } from '../archivio/archivio-costanti';
import { ArchivioService } from '../archivio/archivio-service';
import { CHIAVI_IMPOSTAZIONI } from '../impostazioni/impostazioni-costanti';
import { ImpostazioniService } from '../impostazioni/impostazioni-service';
import {
  ATTRIBUTO_TEMA,
  BRAND_PREDEFINITO,
  COLORE_ESADECIMALE,
  PREFERENZE_TEMA,
  SCHEMA_SCURO,
  SELETTORE_ICONE,
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

/**
 * ICONA INIZIALI
 * Favicon senza logo: l'arco del marchio con le iniziali, come SVG in un data URI.
 */
export function iconaIniziali(iniziali: string, colore: string): string {
  const testo = iniziali.replace(/[&<>]/g, (carattere) => `&#${carattere.charCodeAt(0)};`);
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">' +
    `<path d="M4 18a16 16 0 0 1 32 0v22H4z" fill="${colore}"/>` +
    '<text x="20" y="34" text-anchor="middle" font-family="Georgia,serif" font-size="14" ' +
    `fill="${testoSuBrand(colore)}">${testo}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

@Injectable({
  providedIn: 'root',
})
export class TemaService {
  private readonly archivio = inject(ArchivioService);
  private readonly impostazioni = inject(ImpostazioniService);
  private readonly documento = inject(DOCUMENT);
  private readonly radice = this.documento.documentElement;
  private readonly schemaScuro = this.documento.defaultView?.matchMedia?.(SCHEMA_SCURO);
  private readonly sistemaScuro = signal(this.schemaScuro?.matches ?? false);
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

  /** Favicon: il logo della struttura; senza logo l'arco con le iniziali del nome. */
  private readonly icona = computed(() => {
    const logo = this.impostazioni.testo(CHIAVI_IMPOSTAZIONI.logo);
    if (logo) return new MediaPipe().transform(logo);
    const iniziali = new InizialiPipe().transform(
      this.impostazioni.testo(CHIAVI_IMPOSTAZIONI.nome),
    );
    return iconaIniziali(iniziali, this.brand() ?? BRAND_PREDEFINITO);
  });

  /**
   * Tema scelto. Priorità: localStorage → impostazione della struttura → "sistema" (segue il dispositivo).
   */
  readonly preferenza = computed(() => this.sceltaLocale() ?? this.predefinita() ?? 'sistema');

  /** Tema scuro in uso: scelto, oppure "sistema" con il dispositivo in scuro. */
  readonly scuro = computed(() => {
    const preferenza = this.preferenza();
    return preferenza === 'scuro' || (preferenza === 'sistema' && this.sistemaScuro());
  });

  constructor() {
    effect(() => this.applica(this.preferenza()));
    effect(() => this.applicaBrand(this.brand()));
    effect(() => this.applicaIcona(this.icona()));
    this.schemaScuro?.addEventListener('change', (evento) => this.sistemaScuro.set(evento.matches));
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

  /** Stessa icona nella scheda del browser e sulla schermata home del telefono. */
  private applicaIcona(indirizzo: string): void {
    this.documento.querySelectorAll<HTMLLinkElement>(SELETTORE_ICONE).forEach((link) => {
      link.href = indirizzo;
    });
  }
}
