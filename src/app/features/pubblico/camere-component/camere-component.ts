import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';

import { ICONA_SERVIZIO_PREDEFINITA } from '../../../core/services/camere/camere-costanti';
import { CamereService } from '../../../core/services/camere/camere-service';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { PrezzoPipe } from '../../../shared/pipes/prezzo-pipe';
import { SchedaTipologiaComponent } from '../scheda-tipologia-component/scheda-tipologia-component';

/**
 * Le camere del sito (/camere): tipologie prenotabili e servizi extra con il prezzo.
 * La lingua sta nei parametri solo per ricaricare i testi tradotti quando cambia
 * (la manda il linguaInterceptor).
 */
@Component({
  selector: 'app-camere',
  imports: [TranslocoPipe, IconaComponent, PrezzoPipe, SchedaTipologiaComponent],
  templateUrl: './camere-component.html',
  styleUrl: './camere-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class CamereComponent {
  private readonly camere = inject(CamereService);
  private readonly lingua = inject(LinguaService);

  protected readonly iconaPredefinita = ICONA_SERVIZIO_PREDEFINITA;
  protected readonly tipologie = rxResource({
    params: () => this.lingua.attiva(),
    stream: () => this.camere.elencaTipologiePubbliche(),
  });
  protected readonly extra = rxResource({
    params: () => this.lingua.attiva(),
    stream: () => this.camere.elencaExtraPubblici(),
  });
}
