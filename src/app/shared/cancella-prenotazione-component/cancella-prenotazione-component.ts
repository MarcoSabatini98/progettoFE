import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

import { ErroriService } from '../../core/services/errori/errori-service';
import { LUNGHEZZA_MOTIVO_CANCELLAZIONE } from '../../core/services/prenotazioni/prenotazioni-costanti';
import { PrenotazioniService } from '../../core/services/prenotazioni/prenotazioni-service';
import { CampoComponent } from '../campo-component/campo-component';
import { DataPipe } from '../pipes/data-pipe';
import { PrezzoPipe } from '../pipes/prezzo-pipe';

/**
 * Cancellazione in due passi: prima si vede quanto costa adesso (penale e rimborso),
 * poi si conferma con un motivo facoltativo. Lo staff può applicare una penale diversa.
 */
@Component({
  selector: 'app-cancella-prenotazione',
  imports: [ReactiveFormsModule, TranslocoPipe, CampoComponent, DataPipe, PrezzoPipe],
  templateUrl: './cancella-prenotazione-component.html',
  styleUrl: './cancella-prenotazione-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class CancellaPrenotazioneComponent {
  private readonly prenotazioni = inject(PrenotazioniService);
  protected readonly errori = inject(ErroriService);

  readonly prenotazioneId = input.required<number>();
  /** Dal gestionale: rotte dello staff e penale modificabile. */
  readonly staff = input(false, { transform: booleanAttribute });
  readonly cancellata = output();

  protected readonly lunghezzaMotivo = LUNGHEZZA_MOTIVO_CANCELLAZIONE;
  protected readonly aperta = signal(false);
  protected readonly anteprima = rxResource({
    params: () => (this.aperta() ? this.prenotazioneId() : undefined),
    stream: ({ params: id }) => this.prenotazioni.anteprimaCancellazione(id, !this.staff()),
  });
  /** Il già pagato oltre la penale torna indietro. */
  protected readonly rimborso = computed(() => {
    if (!this.anteprima.hasValue()) {
      return 0;
    }
    const { incassato, penale } = this.anteprima.value();
    return Math.max(0, Number(incassato) - Number(penale));
  });
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    motivo: ['', Validators.maxLength(LUNGHEZZA_MOTIVO_CANCELLAZIONE)],
    /** Vuota: vale quella calcolata. */
    penale: [null as number | null, Validators.min(0)],
  });
  protected readonly inCorso = signal(false);
  protected readonly errore = signal<string | undefined>(undefined);

  /**
   * CONFERMA
   */
  conferma(): void {
    if (this.modulo.invalid) {
      this.modulo.markAllAsTouched();
      return;
    }
    const { motivo, penale } = this.modulo.getRawValue();
    const dati = { motivo: motivo.trim() || null, ...(this.staff() && { penale }) };
    this.inCorso.set(true);
    this.errore.set(undefined);
    this.prenotazioni.cancellaPrenotazione(this.prenotazioneId(), dati, !this.staff()).subscribe({
      next: () => this.cancellata.emit(),
      error: (err: unknown) => {
        this.inCorso.set(false);
        this.errore.set(this.errori.messaggio(err));
      },
    });
  }
}
