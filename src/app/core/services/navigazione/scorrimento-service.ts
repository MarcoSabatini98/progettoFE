import { ViewportScroller } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, Scroll } from '@angular/router';
import { filter } from 'rxjs';

/**
 * Chiave nei data di una rotta elenco-dettaglio: cambiando solo il dettaglio (la rotta figlia)
 * la pagina resta dov'è, invece di tornare in cima.
 */
export const MANTIENI_SCORRIMENTO = 'mantieniScorrimento';

/**
 * SEZIONE FERMA
 * Percorso della prima rotta col segnale MANTIENI_SCORRIMENTO, o null se non ce n'è.
 */
export function sezioneFerma(rotta: ActivatedRouteSnapshot | null): string | null {
  for (; rotta; rotta = rotta.firstChild) {
    if (rotta.data[MANTIENI_SCORRIMENTO]) {
      return rotta.pathFromRoot
        .flatMap((parte) => parte.url.map((segmento) => segmento.path))
        .join('/');
    }
  }
  return null;
}

/**
 * Scorrimento dopo ogni navigazione, come il router con scrollPositionRestoration 'enabled':
 * indietro e avanti tornano dov'erano, le pagine nuove partono dall'alto.
 * Unica eccezione: dentro la stessa sezione ferma la pagina non si muove.
 * Le ancore (#) le gestisce già il router.
 */
@Injectable({
  providedIn: 'root',
})
export class ScorrimentoService {
  private readonly router = inject(Router);
  private readonly scroller = inject(ViewportScroller);
  private sezione: string | null = null;

  constructor() {
    this.router.events
      .pipe(filter((evento): evento is Scroll => evento instanceof Scroll))
      .subscribe((evento) => this.scorri(evento));
  }

  private scorri(evento: Scroll): void {
    const precedente = this.sezione;
    this.sezione = sezioneFerma(this.router.routerState.snapshot.root);
    if (evento.position) {
      this.scroller.scrollToPosition(evento.position);
    } else if (!evento.anchor && (!this.sezione || this.sezione !== precedente)) {
      this.scroller.scrollToPosition([0, 0]);
    }
  }
}
