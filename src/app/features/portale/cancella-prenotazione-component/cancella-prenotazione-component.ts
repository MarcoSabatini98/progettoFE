import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

import { ErroriService } from '../../../core/services/errori/errori-service';
import { LUNGHEZZA_MOTIVO_CANCELLAZIONE } from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { PrenotazioniService } from '../../../core/services/prenotazioni/prenotazioni-service';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { DataPipe } from '../../../shared/pipes/data-pipe';
import { PrezzoPipe } from '../../../shared/pipes/prezzo-pipe';

/**
 * Cancellazione in due passi: prima si vede quanto costa adesso (penale e rimborso),
 * poi si conferma con un motivo facoltativo.
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
  readonly cancellata = output();

  protected readonly lunghezzaMotivo = LUNGHEZZA_MOTIVO_CANCELLAZIONE;
  protected readonly aperta = signal(false);
  protected readonly anteprima = rxResource({
    params: () => (this.aperta() ? this.prenotazioneId() : undefined),
    stream: ({ params: id }) => this.prenotazioni.anteprimaCancellazione(id, true),
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
    const motivo = this.modulo.getRawValue().motivo.trim() || null;
    this.inCorso.set(true);
    this.errore.set(undefined);
    this.prenotazioni.cancellaPrenotazione(this.prenotazioneId(), { motivo }, true).subscribe({
      next: () => this.cancellata.emit(),
      error: (err: unknown) => {
        this.inCorso.set(false);
        this.errore.set(this.errori.messaggio(err));
      },
    });
  }
}
