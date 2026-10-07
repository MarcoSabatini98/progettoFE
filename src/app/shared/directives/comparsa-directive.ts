import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';

/** Quanto dell'elemento deve entrare nello schermo prima che compaia. */
const SOGLIA_COMPARSA = 0.15;

/**
 * Comparsa a scendere: l'elemento resta nascosto finché non entra nello schermo dal basso,
 * poi compare una volta sola e non sparisce più. Quello già passato (sopra lo schermo) è subito lì.
 * Come compare lo decide il CSS (`.da-comparire` e `--da` in base.css).
 * Una sola osservazione all'ingresso, nessun calcolo durante lo scorrimento.
 */
@Directive({ selector: '[appComparsa]' })
export class ComparsaDirective {
  constructor() {
    // Senza IntersectionObserver (browser vecchi, test) l'elemento resta semplicemente visibile.
    if (typeof IntersectionObserver === 'undefined') return;
    const elemento = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const osservatore = new IntersectionObserver(
      ([voce]) => {
        if (voce.isIntersecting || voce.boundingClientRect.top < 0) {
          elemento.classList.add('comparso');
          osservatore.disconnect();
        }
      },
      { threshold: SOGLIA_COMPARSA },
    );
    elemento.classList.add('da-comparire');
    osservatore.observe(elemento);
    inject(DestroyRef).onDestroy(() => osservatore.disconnect());
  }
}
