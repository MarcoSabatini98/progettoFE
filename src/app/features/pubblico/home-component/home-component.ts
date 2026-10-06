import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { CamereService } from '../../../core/services/camere/camere-service';
import { ContenutiService, eVideo } from '../../../core/services/contenuti/contenuti-service';
import { CHIAVI_IMPOSTAZIONI } from '../../../core/services/impostazioni/impostazioni-costanti';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { PERCORSI_PUBBLICI } from '../../../core/services/navigazione/navigazione-costanti';
import { RecensioniService } from '../../../core/services/recensioni/recensioni-service';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { InizialiPipe } from '../../../shared/pipes/iniziali-pipe';
import { MediaPipe } from '../../../shared/pipes/media-pipe';
import { VotoPipe } from '../../../shared/pipes/voto-pipe';
import { CaroselloComponent } from '../carosello-component/carosello-component';
import { GalleriaComponent } from '../galleria-component/galleria-component';
import { SchedaRecensioneComponent } from '../scheda-recensione-component/scheda-recensione-component';
import { SchedaTipologiaComponent } from '../scheda-tipologia-component/scheda-tipologia-component';

/** Recensioni in anteprima: le altre sulla pagina dedicata. */
const ANTEPRIME_HOME = 3;

/** Chi chiede meno animazioni non si trova il video già in movimento. */
const MENO_MOVIMENTO = '(prefers-reduced-motion: reduce)';

/**
 * Pagina iniziale del sito: copertina a tutto schermo (foto o video di sfondo, logo nell'arco)
 * con nome, località e orari, foto della struttura,
 * camere nel carosello e anteprima delle recensioni. Le sezioni senza contenuti non compaiono.
 */
@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    TranslocoPipe,
    IconaComponent,
    InizialiPipe,
    MediaPipe,
    VotoPipe,
    CaroselloComponent,
    GalleriaComponent,
    SchedaRecensioneComponent,
    SchedaTipologiaComponent,
  ],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class HomeComponent {
  private readonly impostazioni = inject(ImpostazioniService);
  private readonly camere = inject(CamereService);
  private readonly contenuti = inject(ContenutiService);
  private readonly recensioni = inject(RecensioniService);
  private readonly lingua = inject(LinguaService);

  protected readonly percorsi = PERCORSI_PUBBLICI;
  protected readonly nome = computed(() => this.impostazioni.testo(CHIAVI_IMPOSTAZIONI.nome));
  protected readonly comune = computed(() => this.impostazioni.testo(CHIAVI_IMPOSTAZIONI.comune));
  protected readonly checkin = computed(() =>
    this.impostazioni.testo(CHIAVI_IMPOSTAZIONI.orarioCheckin),
  );
  protected readonly checkout = computed(() =>
    this.impostazioni.testo(CHIAVI_IMPOSTAZIONI.orarioCheckout),
  );
  protected readonly logo = computed(() => this.impostazioni.testo(CHIAVI_IMPOSTAZIONI.logo));

  protected readonly riduciMovimento =
    inject(DOCUMENT).defaultView?.matchMedia?.(MENO_MOVIMENTO).matches ?? false;
  /** Fermo finché il browser non lo avvia davvero (autoplay bloccato o movimento ridotto). */
  protected readonly inPausa = signal(true);
  private readonly filmato = viewChild<ElementRef<HTMLVideoElement>>('filmato');

  private readonly fotoSfondo = rxResource({
    stream: () => this.contenuti.elencaMedia({ entita: 'home' }),
  });
  private readonly fotoStrutturaRisorsa = rxResource({
    stream: () => this.contenuti.elencaMedia({ entita: 'struttura' }),
  });
  private readonly tipologie = rxResource({
    params: () => this.lingua.attiva(),
    stream: () => this.camere.elencaTipologiePubbliche(),
  });
  protected readonly valutazioni = rxResource({
    stream: () => this.recensioni.leggiValutazioni(),
  });
  private readonly ultimeRecensioni = rxResource({
    stream: () => this.recensioni.elencaPubbliche({ pagina: 1, perPagina: ANTEPRIME_HOME }),
  });

  /** Il primo media della home fa da sfondo; senza, resta il colore della pagina. */
  protected readonly sfondo = computed(() =>
    this.fotoSfondo.hasValue() ? this.fotoSfondo.value()[0] : undefined,
  );
  protected readonly video = computed(() => {
    const media = this.sfondo();
    return !!media && eVideo(media);
  });
  protected readonly fotoStruttura = computed(() =>
    this.fotoStrutturaRisorsa.hasValue() ? this.fotoStrutturaRisorsa.value() : [],
  );
  protected readonly elencoCamere = computed(() =>
    this.tipologie.hasValue() ? this.tipologie.value() : [],
  );
  protected readonly anteprimaRecensioni = computed(() =>
    this.ultimeRecensioni.hasValue() ? this.ultimeRecensioni.value().elementi : [],
  );

  /**
   * ALTERNA VIDEO
   * Pausa e ripresa dello sfondo: nessun movimento che non si possa fermare.
   */
  alternaVideo(): void {
    const video = this.filmato()?.nativeElement;
    if (!video) return;
    if (video.paused) {
      // Rifiutato solo se il browser blocca la riproduzione: resta in pausa.
      video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }
}
