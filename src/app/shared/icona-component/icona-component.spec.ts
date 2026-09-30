import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { IconaComponent } from './icona-component';

describe('IconaComponent', () => {
  it('usa lo SVG del nome come maschera ed è nascosta ai lettori di schermo', async () => {
    const fixture = TestBed.createComponent(IconaComponent);
    fixture.componentRef.setInput('nome', 'wifi');
    await fixture.whenStable();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.style.getPropertyValue('--icona-sorgente')).toBe("url('icone/wifi.svg')");
    expect(host.getAttribute('aria-hidden')).toBe('true');
  });
});
