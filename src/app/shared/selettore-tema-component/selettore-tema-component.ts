import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { ICONE_TEMA } from '../../core/services/tema/tema-costanti';
import { TemaService } from '../../core/services/tema/tema-service';
import { IconaComponent } from '../icona-component/icona-component';

/**
 * Interruttore chiaro/scuro nella barra in alto, come gruppo di radio.
 * Segna il tema in uso: senza una scelta quello della struttura o del dispositivo.
 */
@Component({
  selector: 'app-selettore-tema',
  imports: [TranslocoPipe, IconaComponent],
  templateUrl: './selettore-tema-component.html',
  styleUrl: './selettore-tema-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelettoreTemaComponent {
  protected readonly tema = inject(TemaService);
  protected readonly icone = ICONE_TEMA;
  protected readonly scelte = Object.keys(ICONE_TEMA) as (keyof typeof ICONE_TEMA)[];
  protected readonly attivo = computed(() => (this.tema.scuro() ? 'scuro' : 'chiaro'));
}
