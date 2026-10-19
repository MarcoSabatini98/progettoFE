import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { CamereService } from '../../../core/services/camere/camere-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import {
  LUNGHEZZA_PULIZIA,
  PRIORITA,
  TIPI_PULIZIA,
} from '../../../core/services/pulizie/pulizie-costanti';
import { PulizieService } from '../../../core/services/pulizie/pulizie-service';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import {
  AttivitaPuliziaInterface,
  Priorita,
  TipoPulizia,
} from '../../../shared/models/attivita-pulizia/attivita-pulizia-model';

/**
 * Attività fuori programma per il giorno scelto (es. ispezione o pulizia profonda):
 * camera, tipo, priorità e, se serve, l'addetto.
 */
@Component({
  selector: 'app-nuova-pulizia',
  imports: [ReactiveFormsModule, TranslocoPipe, CampoComponent, IconaComponent],
  templateUrl: './nuova-pulizia-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class NuovaPuliziaComponent {
  private readonly pulizie = inject(PulizieService);
  private readonly camere = inject(CamereService);
  protected readonly errori = inject(ErroriService);

  /** 'YYYY-MM-DD' */
  readonly giorno = input.required<string>();
  readonly creata = output<AttivitaPuliziaInterface>();

  protected readonly tipi = TIPI_PULIZIA;
  protected readonly priorita = PRIORITA;
  protected readonly lunghezza = LUNGHEZZA_PULIZIA;
  protected readonly elencoCamere = rxResource({ stream: () => this.camere.elencaCamere() });
  protected readonly addetti = rxResource({ stream: () => this.pulizie.elencaAddetti() });
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    camera_id: [null as number | null, Validators.required],
    tipo: ['riassetto' as TipoPulizia],
    priorita: ['normale' as Priorita],
    assegnata_a: [null as number | null],
    note: ['', Validators.maxLength(LUNGHEZZA_PULIZIA.note)],
  });

  /**
   * CREA
   */
  crea(): void {
    const { camera_id, note, ...resto } = this.modulo.getRawValue();
    if (this.modulo.invalid || camera_id === null) {
      this.modulo.markAllAsTouched();
      return;
    }
    this.inCorso.set(true);
    this.errore.set('');
    this.pulizie
      .creaAttivita({ ...resto, camera_id, data_prevista: this.giorno(), note: note || null })
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: (attivita) => {
          this.modulo.reset();
          this.creata.emit(attivita);
        },
        error: (motivo: unknown) => this.errore.set(this.errori.messaggio(motivo)),
      });
  }
}
