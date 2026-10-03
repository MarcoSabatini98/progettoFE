import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AuthService } from '../../../core/services/auth/auth-service';
import { nomeConversazione } from '../../../core/services/chat/nome-conversazione';
import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import { ConversazioneInterface } from '../../../shared/models/conversazione/conversazione-model';
import { DataPipe } from '../../../shared/pipes/data-pipe';

/** Conversazione nell'elenco: nome, inizio dell'ultimo messaggio, ora e non letti. */
@Component({
  selector: 'app-riga-conversazione',
  imports: [RouterLink, RouterLinkActive, TranslocoPipe, DataPipe],
  templateUrl: './riga-conversazione-component.html',
  styleUrl: './riga-conversazione-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RigaConversazioneComponent {
  private readonly auth = inject(AuthService);

  readonly conversazione = input.required<ConversazioneInterface>();

  protected readonly percorso = PERCORSI_STAFF.chat;
  protected readonly nome = computed(() =>
    nomeConversazione(this.conversazione(), this.auth.utente()?.id),
  );
}
