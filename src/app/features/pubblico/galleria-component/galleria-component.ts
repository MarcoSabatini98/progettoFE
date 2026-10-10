import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { MediaInterface } from '../../../shared/models/media/media-model';
import { MediaPipe } from '../../../shared/pipes/media-pipe';

/**
 * Galleria a schermate: foto tutte uguali (4:3), una alla volta da telefono e tre da desktop.
 * Scorre col dito (scroll-snap nativo), coi puntini e con le frecce, che dopo l'ultima
 * schermata ricominciano dalla prima. Da tastiera la striscia prende il focus e scorre con le frecce.
 */
@Component({
  selector: 'app-galleria',
  imports: [TranslocoPipe, IconaComponent, MediaPipe],
  templateUrl: './galleria-component.html',
  styleUrl: './galleria-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:resize)': 'misura()' },
})
export class GalleriaComponent {
  readonly media = input.required<MediaInterface[]>();
  /** Nome della galleria per i lettori di schermo. */
  readonly etichetta = input.required<string>();

  private readonly striscia = viewChild.required<ElementRef<HTMLElement>>('striscia');
  /** Quante foto stanno in una schermata lo decide il CSS: qui si misura. */
  private visibili = 1;
  protected readonly pagine = signal(1);
  protected readonly attiva = signal(0);
  /** Un puntino per schermata. */
  protected readonly schermate = computed(() => Array.from({ length: this.pagine() }, (_, i) => i));

  constructor() {
    afterRenderEffect(() => {
      this.media();
      this.misura();
    });
  }

  /**
   * MISURA
   * Schermate totali e schermata in vista, dalla larghezza della striscia e della prima foto.
   */
  protected misura(): void {
    const striscia = this.striscia().nativeElement;
    const prima = striscia.firstElementChild as HTMLElement | null;
    if (!prima?.offsetWidth || !striscia.clientWidth) return;
    const { scrollLeft, scrollWidth, clientWidth } = striscia;
    this.visibili = Math.max(1, Math.round(clientWidth / prima.offsetWidth));
    this.pagine.set(Math.ceil(this.media().length / this.visibili));
    // L'ultima schermata può essere mezza vuota: in fondo alla striscia è comunque l'ultima.
    const inFondo = scrollLeft + clientWidth >= scrollWidth - 1;
    this.attiva.set(inFondo ? this.pagine() - 1 : Math.round(scrollLeft / clientWidth));
  }

  /** Dopo l'ultima schermata si ricomincia dalla prima, e viceversa. */
  protected scorri(verso: 1 | -1): void {
    const pagine = this.pagine();
    this.vai((this.attiva() + verso + pagine) % pagine);
  }

  /** L'animazione la decide il CSS (scroll-behavior); lo scroll-snap allinea la foto. */
  protected vai(pagina: number): void {
    const striscia = this.striscia().nativeElement;
    const foto = striscia.children[pagina * this.visibili] as HTMLElement | undefined;
    striscia.scrollTo({ left: foto?.offsetLeft ?? 0 });
  }
}
