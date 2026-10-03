import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { campiCambiati } from '../../../core/services/api/campi-cambiati';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { PRIORITA, TIPI_PULIZIA } from '../../../core/services/pulizie/pulizie-costanti';
import { PulizieService } from '../../../core/services/pulizie/pulizie-service';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import {
  AttivitaPuliziaAggiornaPayload,
  AttivitaPuliziaInterface,
  Priorita,
  TipoPulizia,
} from '../../../shared/models/attivita-pulizia/attivita-pulizia-model';

/**
 * Pianificazione di un'attività per chi gestisce le pulizie: addetto, giorno, tipo e priorità.
 * Salva i soli campi cambiati.
 */
@Component({
  selector: 'app-dati-pulizia',
  imports: [ReactiveFormsModule, TranslocoPipe, CampoComponent],
  templateUrl: './dati-pulizia-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class DatiPuliziaComponent {
  private readonly pulizie = inject(PulizieService);
  private readonly avvisi = inject(AvvisiService);
  private readonly transloco = inject(TranslocoService);
  protected readonly errori = inject(ErroriService);

  readonly attivita = input.required<AttivitaPuliziaInterface>();
  readonly salvata = output<AttivitaPuliziaInterface>();

  protected readonly tipi = TIPI_PULIZIA;
  protected readonly priorita = PRIORITA;
  protected readonly addetti = rxResource({ stream: () => this.pulizie.elencaAddetti() });
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    assegnata_a: [null as number | null],
    data_prevista: ['', Validators.required],
    tipo: ['riassetto' as TipoPulizia],
    priorita: ['normale' as Priorita],
  });

  constructor() {
    effect(() => this.compila(this.attivita()));
  }

  /**
   * SALVA
   */
  salva(): void {
    if (this.modulo.invalid) {
      this.modulo.markAllAsTouched();
      return;
    }
    const modifiche: AttivitaPuliziaAggiornaPayload = campiCambiati(this.modulo.controls);
    if (!Object.keys(modifiche).length) return;
    this.inCorso.set(true);
    this.errore.set('');
    this.pulizie
      .aggiornaAttivita(this.attivita().id, modifiche)
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: (attivita) => {
          this.avvisi.mostra(this.transloco.translate('gestionale.pulizie.salvata'), 'successo');
          this.salvata.emit(attivita);
        },
        error: (motivo: unknown) => this.errore.set(this.errori.messaggio(motivo)),
      });
  }

  private compila(attivita: AttivitaPuliziaInterface): void {
    this.modulo.reset({
      assegnata_a: attivita.assegnata_a,
      data_prevista: attivita.data_prevista,
      tipo: attivita.tipo,
      priorita: attivita.priorita,
    });
  }
}
