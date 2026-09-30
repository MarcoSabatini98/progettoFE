import { describe, expect, it } from 'vitest';

import { environment } from '../../../environments/environment';
import { MediaPipe } from './media-pipe';

describe('MediaPipe', () => {
  it('unisce il percorso salvato all’indirizzo dei media', () => {
    expect(new MediaPipe().transform('media/camera.webp')).toBe(
      `${environment.mediaUrl}/media/camera.webp`,
    );
  });
});
