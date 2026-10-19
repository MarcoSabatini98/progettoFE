import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  contentChild,
  input,
  signal,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { IconaComponent } from '../../../shared/icona-component/icona-component';

/**
 * Posti attorno alla slide attiva, dal più importante: con poche slide ognuna ne occupa uno solo.
 * Gli estremi (±2) restano trasparenti: la slide che entra parte da lì e scivola al suo posto.
 */
const POSIZIONI = [0, -1, 1, -2, 2];
/** Pixel di trascinamento oltre i quali il dito cambia slide. */
const SOGLIA_TRASCINAMENTO = 40;

/**
 * Carosello a ventaglio: la slide attiva al centro, le vicine ai lati più piccole e sfocate.
 * Si muove coi pulsanti, coi puntini, con le frecce della tastiera e col dito.
 * Una sola slide resta ferma, senza comandi. Il contenuto lo decide chi lo usa:
 * `<ng-template let-elemento>` dentro `<app-carosello>`.
 */
@Component({
  selector: 'app-carosello',
  imports: [NgTemplateOutlet, TranslocoPipe, IconaComponent],
  templateUrl: './carosello-component.html',
  styleUrl: './carosello-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CaroselloComponent<T> {
  readonly elementi = input.required<readonly T[]>();
  /** Nome del carosello per i lettori di schermo. */
  readonly etichetta = input.required<string>();

  protected readonly modello = contentChild.required<TemplateRef<{ $implicit: T }>>(TemplateRef);
  protected readonly attiva = signal(0);
  protected readonly scorrevole = computed(() => this.elementi().length > 1);
  /** In ordine di indice: le slide non cambiano posto nel DOM e le transizioni restano fluide. */
  protected readonly slide = computed(() => {
    const occupate = new Map<number, { indice: number; posizione: number; elemento: T }>();
    for (const posizione of POSIZIONI) {
      const indice = this.indiceValido(this.attiva() + posizione);
      if (!occupate.has(indice)) {
        occupate.set(indice, { indice, posizione, elemento: this.elementi()[indice] });
      }
    }
    return [...occupate.values()].sort((a, b) => a.indice - b.indice);
  });

  private inizioTrascinamento: number | null = null;

  protected scorri(verso: 1 | -1): void {
    this.attiva.update((attiva) => this.indiceValido(attiva + verso));
  }

  protected vai(indice: number): void {
    this.attiva.set(indice);
  }

  protected inizia(evento: PointerEvent): void {
    this.inizioTrascinamento = evento.clientX;
  }

  /** Trascinando verso sinistra arriva la slide successiva, come sfogliando. */
  protected rilascia(evento: PointerEvent): void {
    const spostamento = evento.clientX - (this.inizioTrascinamento ?? evento.clientX);
    this.inizioTrascinamento = null;
    if (this.scorrevole() && Math.abs(spostamento) > SOGLIA_TRASCINAMENTO) {
      this.scorri(spostamento < 0 ? 1 : -1);
    }
  }

  // Dopo l'ultima si ricomincia dalla prima, e viceversa.
  private indiceValido(indice: number): number {
    const totale = this.elementi().length;
    return ((indice % totale) + totale) % totale;
  }
}
