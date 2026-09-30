import { Pipe, PipeTransform } from '@angular/core';

import { environment } from '../../../environments/environment';

/**
 * Indirizzo di un'immagine caricata dal suo percorso nel database ("media/abc.webp"):
 * il backend la serve sotto /media, fuori dall'API.
 */
@Pipe({ name: 'media' })
export class MediaPipe implements PipeTransform {
  transform(percorso: string): string {
    return `${environment.mediaUrl}/${percorso}`;
  }
}
