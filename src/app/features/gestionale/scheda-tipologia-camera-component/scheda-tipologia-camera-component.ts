import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AuthService } from '../../../core/services/auth/auth-service';
import { CamereService } from '../../../core/services/camere/camere-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import {
  PERCORSI_PUBBLICI,
  PERCORSI_STAFF,
} from '../../../core/services/navigazione/navigazione-costanti';
import { PERMESSI } from '../../../core/services/ruoli/ruoli-costanti';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { DatiTipologiaComponent } from '../dati-tipologia-component/dati-tipologia-component';
import { EliminaComponent } from '../elimina-component/elimina-component';
import { GalleriaMediaComponent } from '../galleria-media-component/galleria-media-component';

/** Scheda di una tipologia per lo staff: dati e dotazioni, foto del sito, eliminazione. */
@Component({
  selector: 'app-scheda-tipologia-camera',
  imports: [
    RouterLink,
    TranslocoPipe,
    DatiTipologiaComponent,
    EliminaComponent,
    GalleriaMediaComponent,
    IconaComponent,
  ],
  templateUrl: './scheda-tipologia-camera-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class SchedaTipologiaCameraComponent {
  private readonly camere = inject(CamereService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  protected readonly errori = inject(ErroriService);

  /** Id dal percorso. */
  readonly id = input.required({ transform: numberAttribute });

  protected readonly elenco = PERCORSI_STAFF.camere;
  protected readonly sito = PERCORSI_PUBBLICI.camere;
  /** Le foto sono contenuti del sito: servono anche i loro permessi. */
  protected readonly gestisceFoto = computed(() =>
    this.auth.haPermessi([PERMESSI.CONTENUTI_GESTISCI]),
  );
  protected readonly scheda = rxResource({
    params: () => this.id(),
    stream: ({ params: id }) => this.camere.leggiTipologia(id),
  });
  /** Con camere collegate il backend la rifiuta. */
  protected readonly elimina = () => this.camere.eliminaTipologia(this.id());

  protected tornaAllElenco(): void {
    void this.router.navigateByUrl(this.elenco);
  }
}
