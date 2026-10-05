import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { ErroriService } from '../../../core/services/errori/errori-service';
import { FattureService } from '../../../core/services/fatture/fatture-service';
import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { DatiClienteFatturaPayload } from '../../../shared/models/fattura/fattura-model';
import {
  IntestatarioFatturaComponent,
  moduloIntestatario,
} from '../intestatario-fattura-component/intestatario-fattura-component';
import { RigaFatturaComponent } from '../riga-fattura-component/riga-fattura-component';

/**
 * Fatture di una prenotazione e creazione della bozza, intestata al titolare o a un altro
 * (un'azienda): i campi lasciati vuoti restano quelli del titolare. Poi si apre la bozza.
 */
@Component({
  selector: 'app-fatture-prenotazione',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    IconaComponent,
    IntestatarioFatturaComponent,
    RigaFatturaComponent,
  ],
  templateUrl: './fatture-prenotazione-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class FatturePrenotazioneComponent {
  private readonly fatture = inject(FattureService);
  private readonly router = inject(Router);
  private readonly errori = inject(ErroriService);

  readonly prenotazioneId = input.required<number>();

  protected readonly elenco = rxResource({
    params: () => ({ prenotazione_id: this.prenotazioneId() }),
    stream: ({ params }) => this.fatture.elencaFatture(params),
  });
  protected readonly altroIntestatario = new FormControl(false, { nonNullable: true });
  protected readonly intestatario = moduloIntestatario(inject(NonNullableFormBuilder));
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');

  /**
   * CREA BOZZA
   */
  crea(): void {
    if (this.altroIntestatario.value && this.intestatario.invalid) {
      this.intestatario.markAllAsTouched();
      return;
    }
    this.inCorso.set(true);
    this.errore.set('');
    this.fatture
      .creaBozza(this.prenotazioneId(), this.cliente())
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: (bozza) => void this.router.navigate([PERCORSI_STAFF.fatture, bozza.id]),
        error: (motivo: unknown) => this.errore.set(this.errori.messaggio(motivo)),
      });
  }

  // Solo i campi compilati: gli altri il backend li prende dal titolare.
  private cliente(): DatiClienteFatturaPayload | undefined {
    if (!this.altroIntestatario.value) return undefined;
    const compilati = Object.entries(this.intestatario.getRawValue()).filter(([, v]) => v.trim());
    return Object.fromEntries(compilati);
  }
}
