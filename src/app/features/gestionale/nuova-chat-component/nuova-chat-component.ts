import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { TESTO_MAX, TITOLO_MAX } from '../../../core/services/chat/chat-costanti';
import { ChatService } from '../../../core/services/chat/chat-service';
import { PresenzeService } from '../../../core/services/chat/presenze-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { InizialiPipe } from '../../../shared/pipes/iniziali-pipe';

/**
 * Nuova chat interna: un collega per la chat diretta (se esiste già si riapre quella),
 * più colleghi per un gruppo, che allora ha bisogno di un nome. Parte con il primo messaggio.
 */
@Component({
  selector: 'app-nuova-chat',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslocoPipe,
    CampoComponent,
    IconaComponent,
    InizialiPipe,
  ],
  templateUrl: './nuova-chat-component.html',
  styleUrl: './nuova-chat-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class NuovaChatComponent {
  private readonly chat = inject(ChatService);
  private readonly router = inject(Router);
  private readonly transloco = inject(TranslocoService);
  protected readonly presenze = inject(PresenzeService);
  protected readonly errori = inject(ErroriService);

  protected readonly percorso = PERCORSI_STAFF.chat;
  protected readonly testoMax = TESTO_MAX;
  protected readonly titoloMax = TITOLO_MAX;
  protected readonly colleghi = rxResource({ stream: () => this.chat.elencaColleghi() });
  protected readonly scelti = signal<number[]>([]);
  protected readonly gruppo = computed(() => this.scelti().length > 1);
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    titolo: ['', Validators.maxLength(TITOLO_MAX)],
    testo: ['', [Validators.required, Validators.maxLength(TESTO_MAX)]],
  });

  /**
   * SCEGLI
   * Aggiunge o toglie un collega.
   */
  scegli(id: number, scelto: boolean): void {
    this.scelti.update((ids) => (scelto ? [...ids, id] : ids.filter((altro) => altro !== id)));
  }

  /**
   * APRI
   * Poi porta alla conversazione.
   */
  apri(): void {
    const { titolo, testo } = this.modulo.getRawValue();
    const senzaNome = this.gruppo() && !titolo.trim();
    if (senzaNome) {
      this.modulo.controls.titolo.setErrors({ required: true });
    }
    if (this.modulo.invalid || senzaNome || !this.scelti().length) {
      this.modulo.markAllAsTouched();
      this.errore.set(
        this.scelti().length
          ? ''
          : this.transloco.translate('gestionale.chat.nuovaChat.nessunoScelto'),
      );
      return;
    }
    this.inCorso.set(true);
    this.errore.set('');
    this.chat
      .apriChatStaff({
        partecipanti: this.scelti(),
        titolo: this.gruppo() ? titolo.trim() : undefined,
        testo,
      })
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: (conversazione) => this.router.navigate([this.percorso, conversazione.uuid]),
        error: (motivo: unknown) => this.errore.set(this.errori.messaggio(motivo)),
      });
  }
}
