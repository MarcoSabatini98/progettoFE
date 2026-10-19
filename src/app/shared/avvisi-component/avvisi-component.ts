import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { ICONE_AVVISO } from '../../core/services/avvisi/avvisi-costanti';
import { AvvisiService } from '../../core/services/avvisi/avvisi-service';
import { IconaComponent } from '../icona-component/icona-component';

/** Pila degli avvisi in sovrimpressione, annunciati ai lettori di schermo. */
@Component({
  selector: 'app-avvisi',
  imports: [TranslocoPipe, IconaComponent],
  templateUrl: './avvisi-component.html',
  styleUrl: './avvisi-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvvisiComponent {
  protected readonly avvisi = inject(AvvisiService);
  protected readonly icone = ICONE_AVVISO;
}
