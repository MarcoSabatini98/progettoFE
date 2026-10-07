import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { ICONA_SERVIZIO_PREDEFINITA } from '../../../core/services/camere/camere-costanti';
import { CamereService } from '../../../core/services/camere/camere-service';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { PERCORSI_PUBBLICI } from '../../../core/services/navigazione/navigazione-costanti';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { PrezzoPipe } from '../../../shared/pipes/prezzo-pipe';
import { SchedaTipologiaComponent } from '../scheda-tipologia-component/scheda-tipologia-component';

/**
 * Le camere del sito (/camere): tipologie prenotabili, le dotazioni che hanno tutte,
 * i servizi extra con il prezzo e l'invito a prenotare.
 * La lingua sta nei parametri solo per ricaricare i testi tradotti quando cambia
 * (la manda il linguaInterceptor).
 */
@Component({
  selector: 'app-camere',
  imports: [RouterLink, TranslocoPipe, IconaComponent, PrezzoPipe, SchedaTipologiaComponent],
  templateUrl: './camere-component.html',
  styleUrl: './camere-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class CamereComponent {
  private readonly camere = inject(CamereService);
  private readonly lingua = inject(LinguaService);

  protected readonly percorsi = PERCORSI_PUBBLICI;
  protected readonly iconaPredefinita = ICONA_SERVIZIO_PREDEFINITA;
  protected readonly tipologie = rxResource({
    params: () => this.lingua.attiva(),
    stream: () => this.camere.elencaTipologiePubbliche(),
  });
  protected readonly extra = rxResource({
    params: () => this.lingua.attiva(),
    stream: () => this.camere.elencaExtraPubblici(),
  });
  /** Le dotazioni presenti in ogni tipologia: si dicono una volta sola. */
  protected readonly comuni = computed(() => {
    const [prima, ...altre] = this.tipologie.hasValue() ? this.tipologie.value() : [];
    return (prima?.servizi ?? []).filter((servizio) =>
      altre.every((tipologia) => tipologia.servizi?.some((voce) => voce.id === servizio.id)),
    );
  });
}
