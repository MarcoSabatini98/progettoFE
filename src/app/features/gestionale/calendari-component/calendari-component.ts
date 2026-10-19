import { ChangeDetectionStrategy, Component, input, numberAttribute, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { CalendariEsterniComponent } from '../calendari-esterni-component/calendari-esterni-component';
import { LinkEsportazioneComponent } from '../link-esportazione-component/link-esportazione-component';

const SEZIONI = ['importa', 'esporta'] as const;
type Sezione = (typeof SEZIONI)[number];

/**
 * Sincronizzazione con i portali: i loro calendari da importare e i link delle camere da esportare.
 * Con l'id nel percorso (link della notifica) apre quel calendario.
 */
@Component({
  selector: 'app-calendari',
  imports: [TranslocoPipe, CalendariEsterniComponent, LinkEsportazioneComponent],
  templateUrl: './calendari-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class CalendariComponent {
  readonly id = input(undefined, { transform: (id: unknown) => numberAttribute(id, undefined) });

  protected readonly sezioni = SEZIONI;
  protected readonly sezione = signal<Sezione>('importa');
}
