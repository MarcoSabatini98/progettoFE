import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { conSpunta } from '../../../core/services/api/con-spunta';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { PermessiService } from '../../../core/services/permessi/permessi-service';
import {
  CoppiaRuoli,
  RegolaChatInterface,
} from '../../../shared/models/regola-chat/regola-chat-model';
import { CodiceRuolo } from '../../../shared/models/ruolo/ruolo-model';

/** La regola vale nei due sensi: la coppia ha i ruoli in ordine alfabetico, come nel backend. */
const chiave = (ruoloA: CodiceRuolo, ruoloB: CodiceRuolo) => `${ruoloA}|${ruoloB}`;

/**
 * Chi può scrivere a chi nella chat interna: una casella per ogni coppia di ruoli
 * dello staff, colleghi dello stesso ruolo compresi (i gruppi di squadra).
 */
@Component({
  selector: 'app-regole-chat',
  imports: [TranslocoPipe],
  templateUrl: './regole-chat-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class RegoleChatComponent {
  private readonly permessi = inject(PermessiService);
  private readonly avvisi = inject(AvvisiService);
  private readonly transloco = inject(TranslocoService);
  private readonly errori = inject(ErroriService);

  /** Ruoli dello staff: solo loro usano la chat interna. */
  readonly ruoli = input.required<CodiceRuolo[]>();
  readonly regole = input.required<RegolaChatInterface[]>();

  protected readonly coppie = computed(() => {
    const ordinati = [...this.ruoli()].sort();
    return ordinati.flatMap((ruoloA, indice) =>
      ordinati.slice(indice).map((ruoloB): CoppiaRuoli => [ruoloA, ruoloB]),
    );
  });
  protected readonly scelte = linkedSignal(() => this.chiavi(this.regole()));
  protected readonly chiave = chiave;
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');

  /**
   * SEGNA
   * Spunta o toglie una coppia, senza salvare.
   */
  segna([ruoloA, ruoloB]: CoppiaRuoli, spuntata: boolean): void {
    this.scelte.update((scelte) => conSpunta(scelte, chiave(ruoloA, ruoloB), spuntata));
  }

  /**
   * SALVA
   * Manda tutte le coppie spuntate: sostituiscono le regole di prima.
   */
  salva(): void {
    const coppie = this.coppie().filter(([ruoloA, ruoloB]) =>
      this.scelte().has(chiave(ruoloA, ruoloB)),
    );
    this.inCorso.set(true);
    this.errore.set('');
    this.permessi
      .impostaRegoleChat(coppie)
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: (regole) => {
          this.scelte.set(this.chiavi(regole));
          this.avvisi.mostra(
            this.transloco.translate('gestionale.permessi.chat.salvate'),
            'successo',
          );
        },
        error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
      });
  }

  private chiavi(regole: RegolaChatInterface[]): Set<string> {
    return new Set(regole.map((regola) => chiave(regola.ruolo_a, regola.ruolo_b)));
  }
}
