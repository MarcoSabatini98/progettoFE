import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';

import { ICONA_SERVIZIO_PREDEFINITA } from '../../../core/services/camere/camere-costanti';
import { CamereService } from '../../../core/services/camere/camere-service';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { PrezzoPipe } from '../../../shared/pipes/prezzo-pipe';

/**
 * Servizi extra da aggiungere alla prenotazione, con prezzo e modo di calcolo:
 * in fondo a /camere e alla pagina di ogni camera. Senza extra non compare.
 */
@Component({
  selector: 'app-servizi-extra',
  imports: [TranslocoPipe, IconaComponent, PrezzoPipe],
  templateUrl: './servizi-extra-component.html',
  styleUrl: './servizi-extra-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiziExtraComponent {
  private readonly camere = inject(CamereService);
  private readonly lingua = inject(LinguaService);

  protected readonly iconaPredefinita = ICONA_SERVIZIO_PREDEFINITA;
  protected readonly extra = rxResource({
    params: () => this.lingua.attiva(),
    stream: () => this.camere.elencaExtraPubblici(),
  });
}
