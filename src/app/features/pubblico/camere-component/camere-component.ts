import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { CamereService } from '../../../core/services/camere/camere-service';
import { ContenutiService } from '../../../core/services/contenuti/contenuti-service';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { PERCORSI_PUBBLICI } from '../../../core/services/navigazione/navigazione-costanti';
import { CopertinaComponent } from '../copertina-component/copertina-component';
import { RiquadroCameraComponent } from '../riquadro-camera-component/riquadro-camera-component';
import { ServiziExtraComponent } from '../servizi-extra-component/servizi-extra-component';

/**
 * Le camere del sito (/camere): copertina e paragrafo scritti nei contenuti del gestionale,
 * un riquadro per tipologia con le sue dotazioni e, in fondo, i servizi extra con il prezzo.
 * La lingua sta nei parametri solo per ricaricare i testi tradotti quando cambia
 * (la manda il linguaInterceptor).
 */
@Component({
  selector: 'app-camere',
  imports: [
    RouterLink,
    TranslocoPipe,
    CopertinaComponent,
    RiquadroCameraComponent,
    ServiziExtraComponent,
  ],
  templateUrl: './camere-component.html',
  styleUrl: './camere-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class CamereComponent {
  private readonly camere = inject(CamereService);
  private readonly contenuti = inject(ContenutiService);
  private readonly lingua = inject(LinguaService);

  protected readonly percorsoCamere = PERCORSI_PUBBLICI.camere;
  protected readonly pagina = rxResource({
    params: () => this.lingua.attiva(),
    stream: ({ params }) => this.contenuti.leggiPaginaPubblica('camere', params),
  });
  protected readonly testi = computed(() =>
    this.pagina.hasValue() ? this.pagina.value() : undefined,
  );
  protected readonly tipologie = rxResource({
    params: () => this.lingua.attiva(),
    stream: () => this.camere.elencaTipologiePubbliche(),
  });
}
