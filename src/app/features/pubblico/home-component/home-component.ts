import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { TranslocoPipe } from '@jsverse/transloco';

import { CamereService } from '../../../core/services/camere/camere-service';
import { SFONDI_HOME } from '../../../core/services/contenuti/contenuti-costanti';
import { ContenutiService, eVideo } from '../../../core/services/contenuti/contenuti-service';
import { CHIAVI_IMPOSTAZIONI } from '../../../core/services/impostazioni/impostazioni-costanti';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { PERCORSI_PUBBLICI } from '../../../core/services/navigazione/navigazione-costanti';
import { RecensioniService } from '../../../core/services/recensioni/recensioni-service';
import { TemaService } from '../../../core/services/tema/tema-service';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { InizialiPipe } from '../../../shared/pipes/iniziali-pipe';
import { MediaPipe } from '../../../shared/pipes/media-pipe';
import { VotoPipe } from '../../../shared/pipes/voto-pipe';
import { CaroselloComponent } from '../carosello-component/carosello-component';
import { GalleriaComponent } from '../galleria-component/galleria-component';
import { SchedaRecensioneComponent } from '../scheda-recensione-component/scheda-recensione-component';
import { SchedaTipologiaComponent } from '../scheda-tipologia-component/scheda-tipologia-component';
import { ScorriComponent } from '../scorri-component/scorri-component';
import { SezioniComponent } from '../sezioni-component/sezioni-component';

/** Recensioni in anteprima: le altre sulla pagina dedicata. */
const ANTEPRIME_HOME = 3;

/**
 * Pagina iniziale del sito: copertina a tutto schermo (foto o video di sfondo, logo nell'arco, invito a scorrere)
 * con nome, località e orari, foto della struttura,
 * camere nel carosello, anteprima delle recensioni e sezioni immagine-testo scritte dallo staff. Le sezioni senza contenuti non compaiono.
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
    ScorriComponent,
    SezioniComponent,
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

  /** Fermo finché il browser non lo avvia davvero (autoplay bloccato o movimento ridotto). */
  protected readonly inPausa = signal(true);
  private readonly filmato = viewChild<ElementRef<HTMLVideoElement>>('filmato');

  private readonly tema = inject(TemaService);
  /** Chi chiede meno animazioni non si trova il video già in movimento. */
  protected readonly riduciMovimento = this.tema.riduciMovimento;
  private readonly fotoSfondo = rxResource({
    stream: () =>
      forkJoin({
        chiaro: this.contenuti.elencaMedia({ entita: SFONDI_HOME.chiaro }),
        scuro: this.contenuti.elencaMedia({ entita: SFONDI_HOME.scuro }),
      }),
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

  private readonly pagina = rxResource({
    params: () => this.lingua.attiva(),
    stream: ({ params }) => this.contenuti.leggiPaginaPubblica('home', params),
  });

  /**
   * Fa da sfondo il primo media del tema in uso, o in mancanza quello dell'altro tema;
   * senza nessuno resta il colore della pagina.
   */
  protected readonly sfondo = computed(() => {
    if (!this.fotoSfondo.hasValue()) return undefined;
    const { chiaro, scuro } = this.fotoSfondo.value();
    return this.tema.scuro() ? (scuro[0] ?? chiaro[0]) : (chiaro[0] ?? scuro[0]);
  });
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
  protected readonly sezioni = computed(() =>
    this.pagina.hasValue() ? (this.pagina.value().sezioni ?? []) : [],
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
