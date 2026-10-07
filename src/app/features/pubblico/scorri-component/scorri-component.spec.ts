import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { ScorriComponent } from './scorri-component';

describe('ScorriComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [traduzioniTest()] });
  });

  it('porta alla sezione che segue la copertina', async () => {
    const copertina = document.createElement('section');
    const seguente = document.createElement('section');
    seguente.scrollIntoView = vi.fn();
    document.body.append(copertina, seguente);
    const fixture = TestBed.createComponent(ScorriComponent);
    copertina.append(fixture.nativeElement);
    await fixture.whenStable();

    (fixture.nativeElement as HTMLElement).querySelector('button')!.click();

    expect(seguente.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    copertina.remove();
    seguente.remove();
  });
});
