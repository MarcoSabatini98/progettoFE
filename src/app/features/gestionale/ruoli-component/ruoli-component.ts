import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { forkJoin } from 'rxjs';

import { ErroriService } from '../../../core/services/errori/errori-service';
import { RUOLI_ASSEGNABILI } from '../../../core/services/ruoli/ruoli-costanti';
import { PermessiService } from '../../../core/services/permessi/permessi-service';
import { CodiceRuolo } from '../../../shared/models/ruolo/ruolo-model';
import { PermessiRuoloComponent } from '../permessi-ruolo-component/permessi-ruolo-component';
import { RegoleChatComponent } from '../regole-chat-component/regole-chat-component';

/**
 * Solo admin: cosa può fare ogni ruolo dello staff e chi può scrivere a chi in chat.
 * L'admin ha sempre tutti i permessi, quindi non compare tra i ruoli da modificare.
 */
@Component({
  selector: 'app-ruoli',
  imports: [TranslocoPipe, PermessiRuoloComponent, RegoleChatComponent],
  templateUrl: './ruoli-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class RuoliComponent {
  private readonly permessi = inject(PermessiService);
  protected readonly errori = inject(ErroriService);

  protected readonly dati = rxResource({
    stream: () =>
      forkJoin({ matrice: this.permessi.leggiMatrice(), regole: this.permessi.leggiRegoleChat() }),
  });
  protected readonly modificabili = computed(() =>
    (this.dati.value()?.matrice.ruoli ?? []).filter((ruolo) =>
      (RUOLI_ASSEGNABILI as readonly CodiceRuolo[]).includes(ruolo.codice),
    ),
  );
  protected readonly staff = computed(() =>
    (this.dati.value()?.matrice.ruoli ?? [])
      .filter((ruolo) => ruolo.staff)
      .map((ruolo) => ruolo.codice),
  );
}
