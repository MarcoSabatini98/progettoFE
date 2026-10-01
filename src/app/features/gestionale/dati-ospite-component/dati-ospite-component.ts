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
import { finalize } from 'rxjs';

import { campiCambiati } from '../../../core/services/api/campi-cambiati';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import {
  LINGUA_PREDEFINITA,
  LINGUE,
  NOMI_LINGUE,
} from '../../../core/services/lingua/lingua-costanti';
import { LUNGHEZZA_ANAGRAFICA } from '../../../core/services/ospiti/ospiti-costanti';
import { OspitiService } from '../../../core/services/ospiti/ospiti-service';
import {
  CODICE_ITALIA,
  LUNGHEZZA_NUMERO_DOCUMENTO,
  SESSI,
  TIPI_DOCUMENTO_IDENTITA,
} from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { LUNGHEZZA_DATI_PERSONALI } from '../../../core/services/utenti/utenti-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { CercaLuogoComponent } from '../../../shared/cerca-luogo-component/cerca-luogo-component';
import { LuogoTrovatoInterface } from '../../../shared/models/alloggiati-luogo/alloggiati-luogo-model';
import { Lingua } from '../../../shared/models/lingua/lingua-model';
import {
  OspiteAggiornaPayload,
  SchedaOspiteInterface,
  Sesso,
} from '../../../shared/models/ospite/ospite-model';

/** Campi che si compilano scegliendo dalla tabella dei luoghi di Alloggiati Web. */
type CampoDaLuogo =
  | 'cittadinanza_codice'
  | 'luogo_rilascio_codice'
  | 'stato_nascita_codice'
  | 'comune_nascita_codice'
  | 'provincia_nascita';

/**
 * Anagrafica completa dell'ospite per lo staff: contatti, dati della schedina
 * Alloggiati Web, documento e residenza. Salva i soli campi cambiati.
 */
@Component({
  selector: 'app-dati-ospite',
  imports: [ReactiveFormsModule, TranslocoPipe, CampoComponent, CercaLuogoComponent],
  templateUrl: './dati-ospite-component.html',
  styleUrl: './dati-ospite-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class DatiOspiteComponent {
  private readonly ospiti = inject(OspitiService);
  private readonly avvisi = inject(AvvisiService);
  private readonly transloco = inject(TranslocoService);
  protected readonly errori = inject(ErroriService);

  readonly ospite = input.required<SchedaOspiteInterface>();
  readonly salvato = output<SchedaOspiteInterface>();

  protected readonly sessi = SESSI;
  protected readonly tipiDocumento = TIPI_DOCUMENTO_IDENTITA;
  protected readonly lingue = LINGUE;
  protected readonly nomiLingue = NOMI_LINGUE;
  protected readonly lunghezza = {
    ...LUNGHEZZA_DATI_PERSONALI,
    ...LUNGHEZZA_ANAGRAFICA,
    numeroDocumento: LUNGHEZZA_NUMERO_DOCUMENTO,
  };
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    nome: ['', [Validators.required, Validators.maxLength(LUNGHEZZA_DATI_PERSONALI.nome)]],
    cognome: ['', [Validators.required, Validators.maxLength(LUNGHEZZA_DATI_PERSONALI.cognome)]],
    email: ['', [Validators.email, Validators.maxLength(LUNGHEZZA_ANAGRAFICA.email)]],
    telefono: ['', Validators.maxLength(LUNGHEZZA_DATI_PERSONALI.telefono)],
    lingua: [LINGUA_PREDEFINITA as Lingua],
    sesso: ['' as Sesso | ''],
    data_nascita: [''],
    cittadinanza_codice: [''],
    stato_nascita_codice: [''],
    comune_nascita_codice: [''],
    provincia_nascita: [''],
    tipo_documento: ['', Validators.maxLength(LUNGHEZZA_ANAGRAFICA.tipoDocumento)],
    numero_documento: ['', Validators.maxLength(LUNGHEZZA_NUMERO_DOCUMENTO)],
    luogo_rilascio_codice: [''],
    scadenza_documento: [''],
    codice_fiscale: [
      '',
      [
        Validators.minLength(LUNGHEZZA_ANAGRAFICA.codiceFiscale),
        Validators.maxLength(LUNGHEZZA_ANAGRAFICA.codiceFiscale),
      ],
    ],
    indirizzo: ['', Validators.maxLength(LUNGHEZZA_ANAGRAFICA.indirizzo)],
    cap: ['', Validators.maxLength(LUNGHEZZA_ANAGRAFICA.cap)],
    citta: ['', Validators.maxLength(LUNGHEZZA_ANAGRAFICA.citta)],
    provincia: ['', Validators.maxLength(LUNGHEZZA_ANAGRAFICA.sigla)],
    paese: ['', Validators.maxLength(LUNGHEZZA_ANAGRAFICA.sigla)],
    note: ['', Validators.maxLength(LUNGHEZZA_ANAGRAFICA.note)],
  });

  constructor() {
    effect(() => this.compila(this.ospite()));
  }

  /**
   * SALVA
   */
  salva(): void {
    if (this.modulo.invalid) {
      this.modulo.markAllAsTouched();
      return;
    }
    const modifiche: OspiteAggiornaPayload = campiCambiati(this.modulo.controls);
    if (!Object.keys(modifiche).length) return;
    this.inCorso.set(true);
    this.errore.set('');
    this.ospiti
      .aggiornaOspite(this.ospite().id, modifiche)
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: (ospite) => {
          this.avvisi.mostra(this.transloco.translate('gestionale.anagrafica.salvata'), 'successo');
          this.salvato.emit(ospite);
        },
        error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
      });
  }

  /** Il comune serve solo a chi è nato in Italia. */
  protected natoInItalia(): boolean {
    return this.modulo.controls.stato_nascita_codice.value === CODICE_ITALIA;
  }

  protected scegli(
    campo: Extract<CampoDaLuogo, 'cittadinanza_codice' | 'luogo_rilascio_codice'>,
    luogo: LuogoTrovatoInterface | null,
  ): void {
    this.cambia({ [campo]: luogo?.codice ?? '' });
  }

  // Cambiando stato il comune scelto prima non vale più.
  protected scegliStatoNascita(luogo: LuogoTrovatoInterface | null): void {
    this.cambia({
      stato_nascita_codice: luogo?.codice ?? '',
      comune_nascita_codice: '',
      provincia_nascita: '',
    });
  }

  protected scegliComuneNascita(luogo: LuogoTrovatoInterface | null): void {
    this.cambia({
      comune_nascita_codice: luogo?.codice ?? '',
      provincia_nascita: luogo?.provincia ?? '',
    });
  }

  // I valori impostati dal codice contano come modifiche da salvare.
  private cambia(valori: Partial<Record<CampoDaLuogo, string>>): void {
    this.modulo.patchValue(valori);
    for (const campo of Object.keys(valori) as CampoDaLuogo[]) {
      this.modulo.controls[campo].markAsDirty();
    }
  }

  // I campi assenti diventano vuoti: null non sta in un campo di testo.
  private compila(ospite: SchedaOspiteInterface): void {
    const valori = Object.fromEntries(
      Object.keys(this.modulo.controls).map((campo) => [
        campo,
        ospite[campo as keyof SchedaOspiteInterface] ?? '',
      ]),
    );
    this.modulo.reset(valori);
  }
}
