import { ChangeDetectionStrategy, Component, inject, input, numberAttribute } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { CamereService } from '../../../core/services/camere/camere-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { DatiCameraComponent } from '../dati-camera-component/dati-camera-component';
import { EliminaComponent } from '../elimina-component/elimina-component';
import { TraduzioniComponent } from '../traduzioni-component/traduzioni-component';

/** Scheda di una camera fisica per lo staff: dati, tipologia, stato, traduzioni ed eliminazione. */
@Component({
  selector: 'app-scheda-camera',
  imports: [
    RouterLink,
    TranslocoPipe,
    DatiCameraComponent,
    EliminaComponent,
    IconaComponent,
    TraduzioniComponent,
  ],
  templateUrl: './scheda-camera-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class SchedaCameraComponent {
  private readonly camere = inject(CamereService);
  private readonly router = inject(Router);
  protected readonly errori = inject(ErroriService);

  /** Id dal percorso. */
  readonly id = input.required({ transform: numberAttribute });

  protected readonly elenco = PERCORSI_STAFF.camere;
  protected readonly tipologie = PERCORSI_STAFF.tipologie;
  protected readonly scheda = rxResource({
    params: () => this.id(),
    stream: ({ params: id }) => this.camere.leggiCamera(id),
  });
  protected readonly elencoTipologie = rxResource({
    stream: () => this.camere.elencaTipologie(),
  });
  /** Con prenotazioni collegate il backend la rifiuta. */
  protected readonly elimina = () => this.camere.eliminaCamera(this.id());

  protected tornaAllElenco(): void {
    void this.router.navigateByUrl(this.elenco);
  }
}
