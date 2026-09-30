import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { ICONE_TEMA, PREFERENZE_TEMA } from '../../core/services/tema/tema-costanti';
import { TemaService } from '../../core/services/tema/tema-service';
import { IconaComponent } from '../icona-component/icona-component';

/** Scelta del tema: automatico, chiaro o scuro, come gruppo di radio. */
@Component({
  selector: 'app-selettore-tema',
  imports: [TranslocoPipe, IconaComponent],
  templateUrl: './selettore-tema-component.html',
  styleUrl: './selettore-tema-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelettoreTemaComponent {
  protected readonly tema = inject(TemaService);
  protected readonly preferenze = PREFERENZE_TEMA;
  protected readonly icone = ICONE_TEMA;
}
