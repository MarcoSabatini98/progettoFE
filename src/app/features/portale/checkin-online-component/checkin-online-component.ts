import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { ErroriService } from '../../../core/services/errori/errori-service';
import {
  CODICE_ITALIA,
  LUNGHEZZA_NUMERO_DOCUMENTO,
  SESSI,
  TIPI_CON_DOCUMENTO,
  TIPI_DOCUMENTO_IDENTITA,
} from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { PrenotazioniService } from '../../../core/services/prenotazioni/prenotazioni-service';
import { LUNGHEZZA_DATI_PERSONALI } from '../../../core/services/utenti/utenti-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { CercaLuogoComponent } from '../../../shared/cerca-luogo-component/cerca-luogo-component';
import { LuogoTrovatoInterface } from '../../../shared/models/alloggiati-luogo/alloggiati-luogo-model';
import {
  CheckinOnlineInterface,
  OspiteCheckinInterface,
} from '../../../shared/models/checkin-online/checkin-online-model';
import { OspiteCreaPayload } from '../../../shared/models/ospite/ospite-model';
import { DataPipe } from '../../../shared/pipes/data-pipe';

/**
 * Check-in online dal link ricevuto per email (?token=...): l'ospite inserisce
 * chi soggiorna. Degli ospiti già registrati vede solo il nome e cosa manca:
 * i campi lasciati vuoti non cambiano quello che la struttura ha già.
 */
@Component({
  selector: 'app-checkin-online',
  imports: [ReactiveFormsModule, TranslocoPipe, CampoComponent, CercaLuogoComponent, DataPipe],
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
   * I campi lasciati vuoti non partono. Chi è già registrato mantiene il suo ruolo nel gruppo.
   */
  invia(): void {
    const token = this.token();
    if (!token || this.ospiti.invalid) {
      this.ospiti.markAllAsTouched();
      return;
    }
    this.inCorso.set(true);
    this.errore.set('');
    const ospiti = this.ospiti.getRawValue().map((riga, indice) => ({
      ospite: Object.fromEntries(
        Object.entries(riga).filter(([, valore]) => valore !== ''),
      ) as OspiteCreaPayload,
      tipo_alloggiato: this.registrato(indice)?.tipo_alloggiato,
    }));
    this.prenotazioni
      .inviaCheckinOnline(token, { ospiti })
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: (aggiornato) => this.dati.set(aggiornato),
        error: (err: unknown) => this.errore.set(this.errori.messaggio(err)),
      });
  }

  /** Ospite già registrato in quella posizione, se c'è. */
  protected registrato(indice: number): OspiteCheckinInterface | undefined {
    return this.dati.hasValue() ? this.dati.value().ospiti[indice] : undefined;
  }

  /** Il documento serve a chi guida il gruppo: senza ruolo registrato è il primo. */
  protected conDocumento(indice: number): boolean {
    const tipo = this.registrato(indice)?.tipo_alloggiato;
    return tipo ? (TIPI_CON_DOCUMENTO as readonly string[]).includes(tipo) : indice === 0;
  }

  /** Il comune serve solo a chi è nato in Italia. */
  protected natoInItalia(indice: number): boolean {
    return (
      this.ospiti.at(indice).controls.stato_nascita_codice.value === CODICE_ITALIA ||
      !!this.registrato(indice)?.campi_mancanti.includes('comune_nascita_codice')
    );
  }

  protected scegli(
    indice: number,
    campo: 'cittadinanza_codice' | 'luogo_rilascio_codice',
    luogo: LuogoTrovatoInterface | null,
  ): void {
    this.ospiti.at(indice).controls[campo].setValue(luogo?.codice ?? '');
  }

  // Cambiando stato il comune scelto prima non vale più.
  protected scegliStatoNascita(indice: number, luogo: LuogoTrovatoInterface | null): void {
    this.ospiti.at(indice).patchValue({
      stato_nascita_codice: luogo?.codice ?? '',
      comune_nascita_codice: '',
      provincia_nascita: '',
    });
  }

  protected scegliComuneNascita(indice: number, luogo: LuogoTrovatoInterface | null): void {
    this.ospiti.at(indice).patchValue({
      comune_nascita_codice: luogo?.codice ?? '',
      provincia_nascita: luogo?.provincia ?? '',
    });
  }

  // Una riga per ogni ospite previsto: di chi è già registrato solo nome e cognome.
  private prepara({ adulti, bambini, ospiti }: CheckinOnlineInterface): void {
    this.ospiti.clear();
    for (let indice = 0; indice < adulti + bambini; indice++) {
      this.ospiti.push(this.riga(ospiti[indice]));
    }
  }

  private riga(ospite?: OspiteCheckinInterface) {
    return this.fb.group({
      nome: [
        ospite?.nome ?? '',
        [Validators.required, Validators.maxLength(LUNGHEZZA_DATI_PERSONALI.nome)],
      ],
      cognome: [
        ospite?.cognome ?? '',
        [Validators.required, Validators.maxLength(LUNGHEZZA_DATI_PERSONALI.cognome)],
      ],
      sesso: [''],
      data_nascita: [''],
      cittadinanza_codice: [''],
      stato_nascita_codice: [''],
      comune_nascita_codice: [''],
      provincia_nascita: [''],
      tipo_documento: [''],
      numero_documento: ['', Validators.maxLength(LUNGHEZZA_NUMERO_DOCUMENTO)],
      luogo_rilascio_codice: [''],
      scadenza_documento: [''],
    });
  }
}
