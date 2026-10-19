import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { WidgetChatService } from './widget-chat-service';

describe('WidgetChatService', () => {
  it('apre il riquadro sulla chat o sulle FAQ', () => {
    const widget = TestBed.inject(WidgetChatService);

    expect(widget.aperto()).toBe(false);

    widget.apri(true);
    expect([widget.aperto(), widget.faq()]).toEqual([true, true]);

    widget.apri();
    expect([widget.aperto(), widget.faq()]).toEqual([true, false]);
  });
});
