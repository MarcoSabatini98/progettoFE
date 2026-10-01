import { ChangeDetectionStrategy, Component, DOCUMENT, inject, input, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { IconaComponent } from '../icona-component/icona-component';

/** Link da girare all'ospite: si legge per intero e si copia con un tocco. */
@Component({
  selector: 'app-link-copiabile',
  imports: [TranslocoPipe, IconaComponent],
  templateUrl: './link-copiabile-component.html',
  styleUrl: './link-copiabile-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkCopiabileComponent {
  private readonly appunti = inject(DOCUMENT).defaultView?.navigator.clipboard;

  readonly url = input.required<string>();
  readonly etichetta = input.required<string>();

  protected readonly copiato = signal(false);

  /**
   * COPIA
   */
  copia(): void {
    void this.appunti?.writeText(this.url()).then(() => this.copiato.set(true));
  }
}
