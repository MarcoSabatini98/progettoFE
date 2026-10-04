import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { BarraGraficoInterface, FormatoGrafico } from '../models/barra-grafico/barra-grafico-model';
import { PrezzoPipe } from '../pipes/prezzo-pipe';

/**
 * Grafico a colonne fatto di pulsanti: toccando una colonna (o col mouse, o da tastiera)
 * il suo valore compare sopra il grafico, così si legge anche sul telefono.
 * Parte dalla colonna più alta. Con molte colonne scorre di lato.
 */
@Component({
  selector: 'app-grafico-barre',
  imports: [TranslocoPipe, PrezzoPipe],
  templateUrl: './grafico-barre-component.html',
  styleUrl: './grafico-barre-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraficoBarreComponent {
  /** Nome del grafico per i lettori di schermo. */
  readonly titolo = input.required<string>();
  readonly barre = input.required<readonly BarraGraficoInterface[]>();
  readonly formato = input.required<FormatoGrafico>();
  /** Valore della colonna piena; senza, la colonna più alta. */
  readonly massimo = input<number>();

  protected readonly scelta = linkedSignal(() => {
    const valori = this.barre().map((barra) => barra.valore);
    return valori.indexOf(Math.max(...valori));
  });

  private readonly scala = computed(
    () => this.massimo() ?? Math.max(0, ...this.barre().map((barra) => barra.valore)),
  );

  altezza(valore: number): number {
    return this.scala() > 0 ? Math.min(100, (valore * 100) / this.scala()) : 0;
  }
}
