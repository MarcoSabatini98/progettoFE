import { ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { TemaService } from '../../../core/services/tema/tema-service';
import { IconaComponent } from '../../../shared/icona-component/icona-component';

/**
 * Invito a scorrere sul bordo inferiore di una copertina a tutto schermo:
 * la copertina che lo contiene deve essere posizionata (position: relative).
 */
@Component({
  selector: 'app-scorri',
  imports: [TranslocoPipe, IconaComponent],
  templateUrl: './scorri-component.html',
  styleUrl: './scorri-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScorriComponent {
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly tema = inject(TemaService);

  /**
   * SCORRI
   * Porta alla sezione che segue la copertina.
   */
  scorri(): void {
    const seguente = this.elemento.nativeElement.parentElement?.nextElementSibling;
    seguente?.scrollIntoView({ behavior: this.tema.riduciMovimento ? 'auto' : 'smooth' });
  }
}
