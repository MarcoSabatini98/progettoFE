import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { Observable, finalize } from 'rxjs';

import { ErroriService } from '../../../core/services/errori/errori-service';
import { IconaComponent } from '../../../shared/icona-component/icona-component';

/**
 * Scheda "Elimina" delle pagine del gestionale: la chiamata parte solo dopo la conferma;
 * se il backend rifiuta spiega il motivo.
 */
@Component({
  selector: 'app-elimina',
  imports: [TranslocoPipe, IconaComponent],
  templateUrl: './elimina-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class EliminaComponent {
  private readonly errori = inject(ErroriService);

  readonly titolo = input.required<string>();
  readonly aiuto = input.required<string>();
  readonly conferma = input.required<string>();
  readonly richiesta = input.required<() => Observable<unknown>>();
  readonly eliminato = output();

  protected readonly daEliminare = signal(false);
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');

  /**
   * ELIMINA
   */
  elimina(): void {
    this.inCorso.set(true);
    this.errore.set('');
    this.richiesta()()
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: () => this.eliminato.emit(),
        error: (errore: unknown) => {
          this.daEliminare.set(false);
          this.errore.set(this.errori.messaggio(errore));
        },
      });
  }
}
