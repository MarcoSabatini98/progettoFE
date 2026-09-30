import { describe, expect, it, vi } from 'vitest';

import { chiudiPopover } from './chiudi-popover';

describe('chiudiPopover', () => {
  function menu(aperto: boolean) {
    return { matches: vi.fn(() => aperto), hidePopover: vi.fn() };
  }

  it('chiude il cassetto aperto', () => {
    const cassetto = menu(true);

    chiudiPopover(cassetto as unknown as HTMLElement);

    expect(cassetto.matches).toHaveBeenCalledWith(':popover-open');
    expect(cassetto.hidePopover).toHaveBeenCalled();
  });

  it('non tocca il menu già chiuso o fisso da desktop', () => {
    const fisso = menu(false);

    chiudiPopover(fisso as unknown as HTMLElement);

    expect(fisso.hidePopover).not.toHaveBeenCalled();
  });
});
