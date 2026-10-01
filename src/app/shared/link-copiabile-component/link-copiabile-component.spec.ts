import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { traduzioniTest } from '../../core/services/lingua/configura-transloco-test';
import { LinkCopiabileComponent } from './link-copiabile-component';

describe('LinkCopiabileComponent', () => {
  const writeText = vi.fn();

  beforeEach(() => {
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(document.defaultView!.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    TestBed.configureTestingModule({ imports: [traduzioniTest()] });
  });

  it('mostra il link e lo copia negli appunti', async () => {
    const fixture = TestBed.createComponent(LinkCopiabileComponent);
    fixture.componentRef.setInput('url', 'https://esempio.it/checkin/abc');
    fixture.componentRef.setInput('etichetta', 'Link');
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;

    expect(elemento.querySelector('input')?.value).toBe('https://esempio.it/checkin/abc');
    elemento.querySelector('button')?.click();
    await fixture.whenStable();

    expect(writeText).toHaveBeenCalledWith('https://esempio.it/checkin/abc');
    expect(elemento.querySelector('button')?.textContent).toContain('gestionale.link.copiato');
  });
});
