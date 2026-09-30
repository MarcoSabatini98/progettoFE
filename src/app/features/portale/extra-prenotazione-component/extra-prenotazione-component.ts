import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { Observable } from 'rxjs';

import { CamereService } from '../../../core/services/camere/camere-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { LIMITI_QUANTITA_EXTRA } from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { PrenotazioniService } from '../../../core/services/prenotazioni/prenotazioni-service';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { PrenotazioneInterface } from '../../../shared/models/prenotazione/prenotazione-model';
import { PrezzoPipe } from '../../../shared/pipes/prezzo-pipe';

/**
 * Extra di una prenotazione del cliente. Finché è modificabile si possono togliere
 * e aggiungere; scegliere un extra già presente ne cambia la quantità.
 */
@Component({
  selector: 'app-extra-prenotazione',
  imports: [ReactiveFormsModule, TranslocoPipe, CampoComponent, IconaComponent, PrezzoPipe],
  templateUrl: './extra-prenotazione-component.html',
  styleUrl: './extra-prenotazione-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class ExtraPrenotazioneComponent {
  private readonly camere = inject(CamereService);
  private readonly prenotazioni = inject(PrenotazioniService);
  protected readonly errori = inject(ErroriService);

  readonly prenotazione = input.required<PrenotazioneInterface>();
  readonly modificabile = input(false, { transform: booleanAttribute });
  /** Extra cambiati: il conto va ricaricato. */
  readonly aggiornata = output();

  protected readonly limiti = LIMITI_QUANTITA_EXTRA;
  protected readonly catalogo = rxResource({
    params: () => (this.modificabile() ? true : undefined),
    stream: () => this.camere.elencaExtraPubblici(),
  });
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    servizio_id: [null as number | null, Validators.required],
    quantita: [
      LIMITI_QUANTITA_EXTRA.min,
      [
        Validators.required,
        Validators.min(LIMITI_QUANTITA_EXTRA.min),
        Validators.max(LIMITI_QUANTITA_EXTRA.max),
      ],
    ],
  });
  protected readonly inCorso = signal(false);
  protected readonly errore = signal<string | undefined>(undefined);

  /**
   * AGGIUNGI
   */
  aggiungi(): void {
    const { servizio_id, quantita } = this.modulo.getRawValue();
    if (this.modulo.invalid || servizio_id === null) {
      this.modulo.markAllAsTouched();
      return;
    }
    this.esegui(
      this.prenotazioni.aggiungiServizio(this.prenotazione().id, { servizio_id, quantita }, true),
    );
  }

  /**
   * RIMUOVI
   */
  rimuovi(servizioId: number): void {
    this.esegui(this.prenotazioni.rimuoviServizio(this.prenotazione().id, servizioId, true));
  }

  private esegui(richiesta: Observable<unknown>): void {
    this.inCorso.set(true);
    this.errore.set(undefined);
    richiesta.subscribe({
      next: () => {
        this.inCorso.set(false);
        this.modulo.reset();
        this.aggiornata.emit();
      },
      error: (err: unknown) => {
        this.inCorso.set(false);
        this.errore.set(this.errori.messaggio(err));
      },
    });
  }
}
