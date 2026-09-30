import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { ErroriService } from '../../../core/services/errori/errori-service';
import {
  LUNGHEZZA_NUMERO_DOCUMENTO,
  SESSI,
  TIPI_DOCUMENTO_IDENTITA,
} from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { PrenotazioniService } from '../../../core/services/prenotazioni/prenotazioni-service';
import { LUNGHEZZA_DATI_PERSONALI } from '../../../core/services/utenti/utenti-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { CheckinOnlineInterface } from '../../../shared/models/checkin-online/checkin-online-model';
import { OspiteCreaPayload } from '../../../shared/models/ospite/ospite-model';
import { OspiteSoggiornoInterface } from '../../../shared/models/prenotazione-ospite/prenotazione-ospite-model';
import { DataPipe } from '../../../shared/pipes/data-pipe';

/**
 * Check-in online dal link ricevuto per email (?token=...): l'ospite inserisce
 * chi soggiorna. Il documento serve solo al primo (capofamiglia o ospite singolo).
 */
@Component({
  selector: 'app-checkin-online',
  imports: [ReactiveFormsModule, TranslocoPipe, CampoComponent, DataPipe],
  templateUrl: './checkin-online-component.html',
  styleUrl: './checkin-online-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class CheckinOnlineComponent {
  private readonly prenotazioni = inject(PrenotazioniService);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly errori = inject(ErroriService);

  readonly token = input<string>();

  protected readonly sessi = SESSI;
  protected readonly tipiDocumento = TIPI_DOCUMENTO_IDENTITA;
  protected readonly lunghezza = {
    ...LUNGHEZZA_DATI_PERSONALI,
    numeroDocumento: LUNGHEZZA_NUMERO_DOCUMENTO,
  };
  protected readonly dati = rxResource({
    params: () => this.token(),
    stream: ({ params }) => this.prenotazioni.leggiCheckinOnline(params),
  });
  // La riga iniziale dà il tipo all'elenco: prepara() la sostituisce.
  protected readonly modulo = this.fb.group({ ospiti: this.fb.array([this.riga()]) });
  protected readonly ospiti = this.modulo.controls.ospiti;
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');

  constructor() {
    effect(() => {
      if (this.dati.hasValue()) this.prepara(this.dati.value());
    });
  }

  /**
   * INVIA
   * I campi lasciati vuoti non partono: non cancellano quello che la struttura ha già.
   */
  invia(): void {
    const token = this.token();
    if (!token || this.ospiti.invalid) {
      this.ospiti.markAllAsTouched();
      return;
    }
    this.inCorso.set(true);
    this.errore.set('');
    const ospiti = this.ospiti.getRawValue().map((riga) => ({
      ospite: Object.fromEntries(
        Object.entries(riga).filter(([, valore]) => valore !== ''),
      ) as OspiteCreaPayload,
    }));
    this.prenotazioni
      .inviaCheckinOnline(token, { ospiti })
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: (aggiornato) => this.dati.set(aggiornato),
        error: (err: unknown) => this.errore.set(this.errori.messaggio(err)),
      });
  }

  // Una riga per ogni ospite previsto, con i dati già registrati se ci sono.
  private prepara({ adulti, bambini, ospiti }: CheckinOnlineInterface): void {
    this.ospiti.clear();
    for (let indice = 0; indice < adulti + bambini; indice++) {
      this.ospiti.push(this.riga(ospiti[indice]));
    }
  }

  private riga(ospite?: OspiteSoggiornoInterface) {
    return this.fb.group({
      nome: [
        ospite?.nome ?? '',
        [Validators.required, Validators.maxLength(LUNGHEZZA_DATI_PERSONALI.nome)],
      ],
      cognome: [
        ospite?.cognome ?? '',
        [Validators.required, Validators.maxLength(LUNGHEZZA_DATI_PERSONALI.cognome)],
      ],
      sesso: [ospite?.sesso ?? ''],
      data_nascita: [ospite?.data_nascita ?? ''],
      tipo_documento: [ospite?.tipo_documento ?? ''],
      numero_documento: [
        ospite?.numero_documento ?? '',
        Validators.maxLength(LUNGHEZZA_NUMERO_DOCUMENTO),
      ],
      scadenza_documento: [ospite?.scadenza_documento ?? ''],
    });
  }
}
