import { Injectable, signal } from '@angular/core';

/**
 * Stato del riquadro della chat del sito: lo apre il suo pulsante ma anche
 * le pagine che invitano a scriverci (contatti), direttamente sulle FAQ.
 */
@Injectable({
  providedIn: 'root',
})
export class WidgetChatService {
  readonly aperto = signal(false);
  /** Al posto della chat, le domande frequenti. */
  readonly faq = signal(false);

  /** APRI — sulla chat o sulle domande frequenti. */
  apri(faq = false): void {
    this.faq.set(faq);
    this.aperto.set(true);
  }
}
