import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { ElencoFaqComponent } from '../../../shared/elenco-faq-component/elenco-faq-component';
import { FaqComponent } from './faq-component';

@Component({
  selector: 'app-elenco-faq',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ElencoFaqFinto {}

describe('FaqComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [provideRouter([])],
    });
    TestBed.overrideComponent(FaqComponent, {
      remove: { imports: [ElencoFaqComponent] },
      add: { imports: [ElencoFaqFinto] },
    });
  });

  it('mostra le domande frequenti e rimanda ai contatti', async () => {
    const fixture = TestBed.createComponent(FaqComponent);
    await fixture.whenStable();
    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.querySelector('app-elenco-faq')).not.toBeNull();
    expect(elemento.querySelector('.altre-domande a')?.getAttribute('href')).toBe('/contatti');
  });
});
