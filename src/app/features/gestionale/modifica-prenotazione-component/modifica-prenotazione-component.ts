import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { CamereService } from '../../../core/services/camere/camere-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import {
  LIMITI_OSPITI,
  LUNGHEZZA_NOTE_INTERNE,
  LUNGHEZZA_RICHIESTE,
  LUNGHEZZA_ORA,
} from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { PrenotazioniService } from '../../../core/services/prenotazioni/prenotazioni-service';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import {
  PrenotazioneAggiornaPayload,
  PrenotazioneInterface,
} from '../../../shared/models/prenotazione/prenotazione-model';

/**
 * Cambio di camera, date, ospiti, orario d'arrivo e note. Parte solo ciò che è stato toccato:
 * date, camera e ospiti fanno ricalcolare il prezzo al backend.
 */
@Component({
  selector: 'app-modifica-prenotazione',
  imports: [ReactiveFormsModule, TranslocoPipe, CampoComponent, IconaComponent],
  templateUrl: './modifica-prenotazione-component.html',
  styleUrl: './modifica-prenotazione-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class ModificaPrenotazioneComponent {
  private readonly prenotazioni = inject(PrenotazioniService);
  private readonly camere = inject(CamereService);
  protected readonly errori = inject(ErroriService);

  readonly prenotazione = input.required<PrenotazioneInterface>();
  readonly aggiornata = output();

  protected readonly limiti = LIMITI_OSPITI;
  protected readonly lunghezza = { richieste: LUNGHEZZA_RICHIESTE, note: LUNGHEZZA_NOTE_INTERNE };
  protected readonly aperta = signal(false);
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');
  /** Le camere servono solo a modulo aperto. */
  protected readonly elencoCamere = rxResource({
    params: () => this.aperta() || undefined,
    stream: () => this.camere.elencaCamere(),
  });
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    camera_id: [0],
    data_arrivo: ['', Validators.required],
    data_partenza: ['', Validators.required],
    adulti: [1, [Validators.required, Validators.min(1), Validators.max(LIMITI_OSPITI.adulti)]],
    bambini: [0, [Validators.min(0), Validators.max(LIMITI_OSPITI.bambini)]],
    ora_arrivo_prevista: [''],
    richieste_speciali: ['', Validators.maxLength(LUNGHEZZA_RICHIESTE)],
    note_interne: ['', Validators.maxLength(LUNGHEZZA_NOTE_INTERNE)],
  });

  /**
   * APRI
   * Il modulo riparte dai dati attuali della prenotazione.
   */
  apri(): void {
    const dati = this.prenotazione();
    this.modulo.reset({
      camera_id: dati.camera_id,
      data_arrivo: dati.data_arrivo,
      data_partenza: dati.data_partenza,
      adulti: dati.adulti,
      bambini: dati.bambini,
      ora_arrivo_prevista: dati.ora_arrivo_prevista?.slice(0, LUNGHEZZA_ORA) ?? '',
      richieste_speciali: dati.richieste_speciali ?? '',
      note_interne: dati.note_interne ?? '',
    });
    this.errore.set('');
    this.aperta.set(true);
  }

  /**
   * SALVA
   * Manda i soli campi cambiati; un testo svuotato diventa null.
   */
  salva(): void {
    if (this.modulo.invalid) {
      this.modulo.markAllAsTouched();
      return;
    }
    const modifiche = this.modifiche();
    if (!Object.keys(modifiche).length) {
      this.aperta.set(false);
      return;
    }
    this.inCorso.set(true);
    this.errore.set('');
    this.prenotazioni
      .aggiornaPrenotazione(this.prenotazione().id, modifiche)
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: () => {
          this.aperta.set(false);
          this.aggiornata.emit();
        },
        error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
      });
  }

  private modifiche(): PrenotazioneAggiornaPayload {
    return Object.fromEntries(
      Object.entries(this.modulo.controls)
        .filter(([, controllo]) => controllo.dirty)
        .map(([campo, controllo]) => [campo, controllo.value === '' ? null : controllo.value]),
    );
  }
}
