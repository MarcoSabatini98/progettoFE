import { afterEach, describe, expect, it, vi } from 'vitest';

import { salvaFile } from './salva-file';

describe('salvaFile', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('scarica il file col nome dato e libera il link', () => {
    const crea = vi.fn(() => 'blob:file');
    const libera = vi.fn();
    vi.stubGlobal('URL', { createObjectURL: crea, revokeObjectURL: libera });
    const clic = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const file = new Blob(['%PDF']);

    salvaFile(document, file, '2026-12.pdf');

    expect(crea).toHaveBeenCalledWith(file);
    const link = clic.mock.contexts[0] as HTMLAnchorElement;
    expect(link.download).toBe('2026-12.pdf');
    expect(libera).toHaveBeenCalledWith('blob:file');
  });
});
