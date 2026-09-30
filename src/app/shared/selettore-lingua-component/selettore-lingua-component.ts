import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { LINGUE, NOMI_LINGUE } from '../../core/services/lingua/lingua-costanti';
import { LinguaService } from '../../core/services/lingua/lingua-service';
import { IconaComponent } from '../icona-component/icona-component';

/** Select nativa delle lingue attivate dall'admin; nascosta se ce n'è una sola. */
@Component({
  selector: 'app-selettore-lingua',
  imports: [TranslocoPipe, IconaComponent],
  templateUrl: './selettore-lingua-component.html',
  styleUrl: './selettore-lingua-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelettoreLinguaComponent {
  protected readonly lingua = inject(LinguaService);
  protected readonly nomi = NOMI_LINGUE;

  protected scegli(evento: Event): void {
    const scelta = LINGUE.find((lingua) => lingua === (evento.target as HTMLSelectElement).value);
    if (scelta) {
      this.lingua.imposta(scelta);
    }
  }
}
