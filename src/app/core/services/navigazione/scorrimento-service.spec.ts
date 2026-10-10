import { ViewportScroller } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, NavigationEnd, Router, Scroll } from '@angular/router';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { MANTIENI_SCORRIMENTO, ScorrimentoService } from './scorrimento-service';

describe('ScorrimentoService', () => {
  /** Catena di rotte finta: ogni percorso è una rotta figlia della precedente. */
  function rotte(percorsi: string[], ferma?: string): ActivatedRouteSnapshot {
    const catena = percorsi.map((percorso) => ({
      url: [{ path: percorso }],
      data: percorso === ferma ? { [MANTIENI_SCORRIMENTO]: true } : {},
      firstChild: null as unknown,
      pathFromRoot: [] as unknown[],
    }));
    catena.forEach((rotta, indice) => {
      rotta.firstChild = catena[indice + 1] ?? null;
      rotta.pathFromRoot = catena.slice(0, indice + 1);
    });
    return catena[0] as unknown as ActivatedRouteSnapshot;
  }

  function crea() {
    const eventi = new Subject<unknown>();
    const router = { events: eventi, routerState: { snapshot: { root: rotte([]) } } };
    const scroller = { scrollToPosition: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: ViewportScroller, useValue: scroller },
      ],
    });
    TestBed.inject(ScorrimentoService);
    const vai = (
      percorsi: string[],
      posizione: [number, number] | null = null,
      ancora?: string,
    ) => {
      scroller.scrollToPosition.mockClear();
      router.routerState.snapshot.root = rotte(percorsi, 'chat');
      const fine = new NavigationEnd(1, percorsi.join('/'), percorsi.join('/'));
      eventi.next(new Scroll(fine, posizione, ancora ?? null));
    };
    return { scroller, vai };
  }

  it('una pagina nuova parte dall’alto, anche entrando in una sezione ferma', () => {
    const { scroller, vai } = crea();

    vai(['gestionale', 'planning']);
    expect(scroller.scrollToPosition).toHaveBeenCalledWith([0, 0]);
    vai(['gestionale', 'chat', 'a']);
    expect(scroller.scrollToPosition).toHaveBeenCalledWith([0, 0]);
  });

  it('dentro la stessa sezione ferma la pagina resta dov’è', () => {
    const { scroller, vai } = crea();
    vai(['gestionale', 'chat', 'a']);

    vai(['gestionale', 'chat', 'b']);

    expect(scroller.scrollToPosition).not.toHaveBeenCalled();
  });

  it('indietro torna dov’era; con un’ancora decide il router', () => {
    const { scroller, vai } = crea();

    vai(['gestionale', 'planning'], [0, 420]);
    expect(scroller.scrollToPosition).toHaveBeenCalledWith([0, 420]);
    vai(['faq'], null, 'domanda-3');
    expect(scroller.scrollToPosition).not.toHaveBeenCalled();
  });
});
