import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { Observable, finalize } from 'rxjs';

import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { FattureService } from '../../../core/services/fatture/fatture-service';
import {
  ALIQUOTA_MASSIMA,
  IMPORTO_MASSIMO_RIGA,
  IMPORTO_MINIMO,
  LUNGHEZZE_FATTURA,
} from '../../../core/services/pagamenti/pagamenti-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { FatturaInterface } from '../../../shared/models/fattura/fattura-model';
import { RigaFatturaPayload } from '../../../shared/models/fattura-riga/fattura-riga-model';
import {
  IntestatarioFatturaComponent,
  moduloIntestatario,
} from '../intestatario-fattura-component/intestatario-fattura-component';

/**
 * Bozza di una fattura: intestatario, note e righe (che sostituiscono tutte le precedenti),
 * poi l'emissione, che assegna il numero e manda il PDF al cliente. Si emette solo
 * a modifiche salvate e dopo la conferma: indietro non si torna.
 */
@Component({
  selector: 'app-bozza-fattura',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    CampoComponent,
    IconaComponent,
    IntestatarioFatturaComponent,
  ],
  templateUrl: './bozza-fattura-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda larga' },
})
export class BozzaFatturaComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly fatture = inject(FattureService);
  private readonly avvisi = inject(AvvisiService);
  private readonly transloco = inject(TranslocoService);
  protected readonly errori = inject(ErroriService);

  readonly fattura = input.required<FatturaInterface>();
  readonly aggiornata = output<FatturaInterface>();

  protected readonly lunghezza = LUNGHEZZE_FATTURA;
  protected readonly limiti = {
    importo: IMPORTO_MASSIMO_RIGA,
    quantita: IMPORTO_MINIMO,
    aliquota: ALIQUOTA_MASSIMA,
  };
  protected readonly modulo = this.fb.group({
    cliente: moduloIntestatario(this.fb),
    note: ['', Validators.maxLength(LUNGHEZZE_FATTURA.note)],
    righe: this.fb.array([this.riga()]),
  });
  protected readonly righe = this.modulo.controls.righe;
  protected readonly daEmettere = signal(false);
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');

  constructor() {
    effect(() => this.compila(this.fattura()));
  }

  /**
   * AGGIUNGI RIGA
   * Con l'aliquota dell'ultima, la più probabile.
   */
  aggiungi(): void {
    const ultima = this.righe.at(-1)?.controls.aliquota_iva.value;
    this.righe.push(this.riga({ aliquota_iva: ultima ?? 0 }));
    this.modulo.markAsDirty();
  }

  /**
   * TOGLI RIGA
   */
  togli(indice: number): void {
    this.righe.removeAt(indice);
    this.modulo.markAsDirty();
  }

  /**
   * SALVA
   */
  salva(): void {
    if (this.modulo.invalid) {
      this.modulo.markAllAsTouched();
      return;
    }
    const { cliente, note, righe } = this.modulo.getRawValue();
    const dati = {
      cliente,
      note: note || null,
      righe: righe.map((riga) => ({ ...riga, natura: riga.natura || null })),
    };
    this.esegui(this.fatture.aggiornaBozza(this.fattura().id, dati), 'salvata');
  }

  /**
   * EMETTI
   */
  emetti(): void {
    this.daEmettere.set(false);
    this.esegui(this.fatture.emettiFattura(this.fattura().id), 'emessa');
  }

  private esegui(richiesta: Observable<FatturaInterface>, avviso: string): void {
    this.inCorso.set(true);
    this.errore.set('');
    richiesta.pipe(finalize(() => this.inCorso.set(false))).subscribe({
      next: (fattura) => {
        this.avvisi.mostra(this.transloco.translate(`gestionale.fatture.${avviso}`), 'successo');
        this.aggiornata.emit(fattura);
      },
      error: (motivo: unknown) => this.errore.set(this.errori.messaggio(motivo)),
    });
  }

  private compila(fattura: FatturaInterface): void {
    this.righe.clear();
    for (const riga of fattura.righe ?? []) {
      this.righe.push(this.riga(riga));
    }
    this.modulo.controls.cliente.reset({
      denominazione: fattura.cliente_denominazione ?? '',
      nome: fattura.cliente_nome ?? '',
      cognome: fattura.cliente_cognome ?? '',
      codice_fiscale: fattura.cliente_codice_fiscale ?? '',
      partita_iva: fattura.cliente_partita_iva ?? '',
      indirizzo: fattura.cliente_indirizzo,
      cap: fattura.cliente_cap,
      comune: fattura.cliente_comune,
      provincia: fattura.cliente_provincia ?? '',
      nazione: fattura.cliente_nazione,
      codice_destinatario: fattura.codice_destinatario,
      pec: fattura.pec ?? '',
    });
    this.modulo.controls.note.reset(fattura.note ?? '');
    this.modulo.markAsPristine();
  }

  // I decimali arrivano come stringhe.
  private riga(dati: Partial<RigaFatturaPayload> = {}) {
    const { importo, quantita, aliquota } = this.limiti;
    return this.fb.group({
      descrizione: [
        dati.descrizione ?? '',
        [Validators.required, Validators.maxLength(LUNGHEZZE_FATTURA.descrizione)],
      ],
      quantita: [
        Number(dati.quantita ?? 1),
        [Validators.required, Validators.min(quantita), Validators.max(importo)],
      ],
      prezzo_unitario: [
        Number(dati.prezzo_unitario ?? 0),
        [Validators.required, Validators.min(-importo), Validators.max(importo)],
      ],
      aliquota_iva: [
        Number(dati.aliquota_iva ?? 0),
        [Validators.required, Validators.min(0), Validators.max(aliquota)],
      ],
      natura: [dati.natura ?? '', Validators.maxLength(LUNGHEZZE_FATTURA.natura)],
    });
  }
}
