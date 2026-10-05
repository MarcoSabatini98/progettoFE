import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { ErroriService } from '../../../core/services/errori/errori-service';
import { FattureService } from '../../../core/services/fatture/fatture-service';
import { LUNGHEZZA_MOTIVO } from '../../../core/services/pagamenti/pagamenti-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { FatturaInterface } from '../../../shared/models/fattura/fattura-model';

/**
 * Storno di una fattura emessa: la nota di credito nasce già emessa e va al cliente,
 * per questo parte solo dopo la conferma.
 */
// ponytail: storno totale; lo storno di singole righe (API già pronta) quando servirà.
@Component({
  selector: 'app-nota-di-credito',
  imports: [ReactiveFormsModule, TranslocoPipe, CampoComponent, IconaComponent],
  templateUrl: './nota-di-credito-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class NotaDiCreditoComponent {
  private readonly fatture = inject(FattureService);
  protected readonly errori = inject(ErroriService);

  readonly fattura = input.required<FatturaInterface>();
  readonly creata = output<FatturaInterface>();

  protected readonly lunghezza = LUNGHEZZA_MOTIVO;
  protected readonly motivo = new FormControl('', {
    nonNullable: true,
    validators: Validators.maxLength(LUNGHEZZA_MOTIVO),
  });
  protected readonly daConfermare = signal(false);
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');

  /**
   * STORNA
   */
  storna(): void {
    if (this.motivo.invalid) {
      this.motivo.markAsTouched();
      return;
    }
    this.daConfermare.set(false);
    this.inCorso.set(true);
    this.errore.set('');
    this.fatture
      .creaNotaDiCredito(this.fattura().id, { motivo: this.motivo.value || null })
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: (nota) => this.creata.emit(nota),
        error: (motivo: unknown) => this.errore.set(this.errori.messaggio(motivo)),
      });
  }
}
