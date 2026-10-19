import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Cartella degli SVG Material Symbols copiati in fase di build (vedi angular.json). */
const PERCORSO_ICONE = 'icone';

/**
 * Icona Material Symbols (Rounded) usata come maschera: prende il colore del testo.
 * Decorativa: il significato va nel testo o nell'aria-label di chi la contiene.
 */
@Component({
  selector: 'app-icona',
  templateUrl: './icona-component.html',
  styleUrl: './icona-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    '[style.--icona-sorgente]': 'sorgente()',
  },
})
export class IconaComponent {
  /** Nome Material Symbols, es. "wifi". */
  readonly nome = input.required<string>();

  protected readonly sorgente = computed(() => `url('${PERCORSO_ICONE}/${this.nome()}.svg')`);
}
