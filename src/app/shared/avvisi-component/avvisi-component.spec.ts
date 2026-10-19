import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { AvvisiService } from '../../core/services/avvisi/avvisi-service';
import { traduzioniTest } from '../../core/services/lingua/configura-transloco-test';
import { AvvisiComponent } from './avvisi-component';

describe('AvvisiComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [traduzioniTest()] }));

  it('mostra gli avvisi in una regione annunciata e li chiude al click', async () => {
    const fixture = TestBed.createComponent(AvvisiComponent);
    TestBed.inject(AvvisiService).mostra('Password aggiornata', 'successo');
    await fixture.whenStable();

    const elenco: HTMLElement = fixture.nativeElement.querySelector('ol');
    expect(elenco.getAttribute('aria-live')).toBe('polite');
    expect(elenco.querySelector('.avviso-successo')?.textContent).toContain('Password aggiornata');

    elenco.querySelector('button')!.click();
    await fixture.whenStable();

    expect(elenco.querySelectorAll('li')).toHaveLength(0);
  });
});
