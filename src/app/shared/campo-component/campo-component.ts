import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
  input,
} from '@angular/core';

import { IconaComponent } from '../icona-component/icona-component';

/** Contatore per gli id dei controlli: unici in tutta la pagina. */
let ultimoId = 0;

/**
 * Campo di un modulo: etichetta sopra, controllo nativo proiettato, aiuto o errore sotto.
 *
 *   <app-campo [etichetta]="'accesso.email' | transloco" [errore]="erroreEmail()">
 *     <input type="email" formControlName="email" />
 *   </app-campo>
 *
 * Il controllo senza id ne riceve uno: il browser vuole id o name su ogni campo (autocompilazione).
 */
@Component({
  selector: 'app-campo',
  imports: [IconaComponent],
  templateUrl: './campo-component.html',
  styleUrl: './campo-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampoComponent {
  readonly etichetta = input.required<string>();
  readonly aiuto = input('');
  /** Testo già tradotto; vuoto = nessun errore. */
  readonly errore = input('');

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    afterNextRender(() => {
      const controllo = host.querySelector('input, select, textarea');
      if (controllo && !controllo.id) controllo.id = `campo-${++ultimoId}`;
    });
  }
}
