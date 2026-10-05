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
import { RuoloConPermessiInterface } from '../../../shared/models/matrice-permessi/matrice-permessi-model';
import { CodicePermesso, PermessoInterface } from '../../../shared/models/permesso/permesso-model';
import { RuoloAssegnabile } from '../../../shared/models/ruolo/ruolo-model';

/**
 * Permessi di un ruolo assegnabile, una casella per permesso raggruppati per modulo.
 * Salvando si sostituiscono tutti: valgono dalla richiesta dopo per chi ha quel ruolo.
 */
@Component({
  selector: 'app-permessi-ruolo',
  imports: [TranslocoPipe],
  templateUrl: './permessi-ruolo-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class PermessiRuoloComponent {
  private readonly permessi = inject(PermessiService);
  private readonly avvisi = inject(AvvisiService);
  private readonly transloco = inject(TranslocoService);
  private readonly errori = inject(ErroriService);

  readonly ruolo = input.required<RuoloConPermessiInterface>();
  readonly catalogo = input.required<PermessoInterface[]>();

  /** Il catalogo arriva già in ordine di modulo dal backend. */
  protected readonly moduli = computed(() => {
    const gruppi = new Map<string, PermessoInterface[]>();
    for (const permesso of this.catalogo()) {
      gruppi.set(permesso.modulo, [...(gruppi.get(permesso.modulo) ?? []), permesso]);
    }
    return [...gruppi].map(([modulo, permessi]) => ({ modulo, permessi }));
  });
  protected readonly scelti = linkedSignal(() => new Set(this.ruolo().permessi));
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');

  /**
   * SEGNA
   * Spunta o toglie un permesso, senza salvare.
   */
  segna(codice: CodicePermesso, spuntato: boolean): void {
    this.scelti.update((scelti) => conSpunta(scelti, codice, spuntato));
  }

  /**
   * SALVA
   */
  salva(): void {
    this.inCorso.set(true);
    this.errore.set('');
    this.permessi
      .impostaPermessi(this.ruolo().codice as RuoloAssegnabile, [...this.scelti()])
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: (permessi) => {
          this.scelti.set(new Set(permessi));
          this.avvisi.mostra(this.transloco.translate('gestionale.permessi.salvati'), 'successo');
        },
        error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
      });
  }
}
