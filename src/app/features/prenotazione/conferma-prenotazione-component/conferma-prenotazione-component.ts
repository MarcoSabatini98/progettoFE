import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth/auth-service';
import { CamereService } from '../../../core/services/camere/camere-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { LINGUE, NOMI_LINGUE } from '../../../core/services/lingua/lingua-costanti';
import {
  PERCORSI_PUBBLICI,
  PERCORSI_STAFF,
} from '../../../core/services/navigazione/navigazione-costanti';
import {
  CANALE_STAFF,
  CANALI,
  FORMATO_CODICE_SCONTO,
  LUNGHEZZA_CODICE_SCONTO,
  LUNGHEZZA_ID_ESTERNO,
  LUNGHEZZA_NOTE_INTERNE,
  LUNGHEZZA_RICHIESTE,
  STATI_NUOVA_STAFF,
} from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { PrenotazioniService } from '../../../core/services/prenotazioni/prenotazioni-service';
import { RUOLI } from '../../../core/services/ruoli/ruoli-costanti';
import { TariffeService } from '../../../core/services/tariffe/tariffe-service';
import { LUNGHEZZA_DATI_PERSONALI } from '../../../core/services/utenti/utenti-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { CodiceScontoVerificatoInterface } from '../../../shared/models/codice-sconto/codice-sconto-model';
import { Lingua } from '../../../shared/models/lingua/lingua-model';
import { Canale } from '../../../shared/models/prenotazione/prenotazione-model';
import {
  PreventivoInterface,
  PreventivoPayload,
} from '../../../shared/models/preventivo/preventivo-model';
import { SceltaSoggiornoInterface } from '../../../shared/models/scelta-soggiorno/scelta-soggiorno-model';
import { DataPipe } from '../../../shared/pipes/data-pipe';
import { PrezzoPipe } from '../../../shared/pipes/prezzo-pipe';
import { RiepilogoPrezzoComponent } from '../../../shared/riepilogo-prezzo-component/riepilogo-prezzo-component';

/**
 * Ultimo passo della prenotazione: codice sconto, pacchetto, extra, titolare e richieste.
 * Ogni scelta ricalcola il preventivo; a prenotazione fatta si apre la sua pagina.
 */
@Component({
  selector: 'app-conferma-prenotazione',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    CampoComponent,
    IconaComponent,
    DataPipe,
    PrezzoPipe,
    RiepilogoPrezzoComponent,
  ],
  templateUrl: './conferma-prenotazione-component.html',
  styleUrl: './conferma-prenotazione-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfermaPrenotazioneComponent {
  private readonly auth = inject(AuthService);
  private readonly camere = inject(CamereService);
  private readonly lingua = inject(LinguaService);
  private readonly prenotazioni = inject(PrenotazioniService);
  private readonly router = inject(Router);
  private readonly tariffe = inject(TariffeService);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly errori = inject(ErroriService);

  readonly scelta = input.required<SceltaSoggiornoInterface>();
  /** Dal gestionale: canale, stato e note interne; email del titolare facoltativa. */
  readonly staff = input(false, { transform: booleanAttribute });
  readonly cambiaCamera = output();

  protected readonly lunghezza = {
    ...LUNGHEZZA_DATI_PERSONALI,
    codice: LUNGHEZZA_CODICE_SCONTO,
    richieste: LUNGHEZZA_RICHIESTE,
    idEsterno: LUNGHEZZA_ID_ESTERNO,
    note: LUNGHEZZA_NOTE_INTERNE,
  };
  protected readonly scelte = {
    canali: CANALI,
    stati: STATI_NUOVA_STAFF,
    lingue: LINGUE,
    nomiLingue: NOMI_LINGUE,
  };
  /** Il cliente collegato prenota a suo nome; visitatori e staff indicano il titolare. */
  protected readonly chiedeTitolare = computed(() => !this.auth.haRuolo([RUOLI.CLIENTE]));

  protected readonly opzioni = this.fb.group({
    codice_sconto: [
      '',
      [Validators.maxLength(LUNGHEZZA_CODICE_SCONTO), Validators.pattern(FORMATO_CODICE_SCONTO)],
    ],
    pacchetto_id: this.fb.control<number | null>(null),
    servizi: this.fb.control<number[]>([]),
    richieste_speciali: ['', Validators.maxLength(LUNGHEZZA_RICHIESTE)],
    ora_arrivo_prevista: [''],
  });
  protected readonly titolare = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(LUNGHEZZA_DATI_PERSONALI.nome)]],
    cognome: ['', [Validators.required, Validators.maxLength(LUNGHEZZA_DATI_PERSONALI.cognome)]],
    // Obbligatoria solo online: [required] nel template.
    email: ['', Validators.email],
    telefono: ['', Validators.maxLength(LUNGHEZZA_DATI_PERSONALI.telefono)],
  });
  protected readonly gestione = this.fb.group({
    canale: this.fb.control<Canale>(CANALE_STAFF),
    stato: this.fb.control<(typeof STATI_NUOVA_STAFF)[number]>(STATI_NUOVA_STAFF[0]),
    id_esterno: ['', Validators.maxLength(LUNGHEZZA_ID_ESTERNO)],
    note_interne: ['', Validators.maxLength(LUNGHEZZA_NOTE_INTERNE)],
    /** Lingua delle email al titolare. */
    lingua: this.fb.control<Lingua>(this.lingua.attiva()),
  });

  protected readonly pacchetti = rxResource({
    params: () => ({ lingua: this.lingua.attiva() }),
    stream: () => this.tariffe.elencaPacchettiPubblici(),
  });
  /** Pacchetti per tutte le tipologie o per questa, se il soggiorno è abbastanza lungo. */
  protected readonly pacchettiAdatti = computed(() => {
    const { tipologia, preventivo } = this.scelta();
    const pacchetti = this.pacchetti.hasValue() ? this.pacchetti.value() : [];
    return pacchetti.filter(
      (pacchetto) =>
        (pacchetto.tipologia_id ?? tipologia.id) === tipologia.id &&
        (pacchetto.notti_min ?? 0) <= preventivo.numero_notti,
    );
  });
  protected readonly extra = rxResource({
    params: () => ({ lingua: this.lingua.attiva() }),
    stream: () => this.camere.elencaExtraPubblici(),
  });

  protected readonly codiceApplicato = signal<CodiceScontoVerificatoInterface | undefined>(
    undefined,
  );
  protected readonly inVerifica = signal(false);
  protected readonly erroreCodice = signal('');
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');

  private readonly richiesta = signal<PreventivoPayload | undefined>(undefined);
  protected readonly ricalcolo = rxResource({
    params: () => this.richiesta(),
    stream: ({ params }) => this.tariffe.calcolaPreventivo(params),
  });
  /** Ultimo preventivo riuscito: durante un ricalcolo resta quello di prima. */
  protected readonly preventivo = linkedSignal<
    PreventivoInterface | undefined,
    PreventivoInterface
  >({
    source: () => (this.ricalcolo.hasValue() ? this.ricalcolo.value() : undefined),
    computation: (nuovo, precedente) => nuovo ?? precedente?.value ?? this.scelta().preventivo,
  });

  /**
   * APPLICA CODICE
   * Verifica il codice e, se esiste, ricalcola il prezzo con lo sconto.
   */
  applicaCodice(): void {
    const campo = this.opzioni.controls.codice_sconto;
    if (campo.invalid || !campo.value) {
      campo.markAsTouched();
      return;
    }
    this.inVerifica.set(true);
    this.erroreCodice.set('');
    this.tariffe
      .verificaCodiceSconto(campo.value)
      .pipe(finalize(() => this.inVerifica.set(false)))
      .subscribe({
        next: (codice) => {
          this.codiceApplicato.set(codice);
          this.ricalcola();
        },
        error: (errore: unknown) => this.erroreCodice.set(this.errori.messaggio(errore)),
      });
  }

  /**
   * TOGLI CODICE
   */
  togliCodice(): void {
    this.codiceApplicato.set(undefined);
    this.opzioni.controls.codice_sconto.reset();
    this.ricalcola();
  }

  /**
   * ALTERNA EXTRA
   * Un'unità per extra: le quantità le cambia lo staff.
   */
  alternaExtra(servizioId: number, scelto: boolean): void {
    const servizi = this.opzioni.controls.servizi;
    servizi.setValue(
      scelto ? [...servizi.value, servizioId] : servizi.value.filter((id) => id !== servizioId),
    );
    this.ricalcola();
  }

  /**
   * RICALCOLA
   */
  ricalcola(): void {
    this.richiesta.set({ tipologia_id: this.scelta().tipologia.id, ...this.soggiorno() });
  }

  /**
   * INVIA
   * Prenota la camera bloccata e apre la pagina della prenotazione, dove si paga.
   */
  invia(): void {
    const titolareMancante = this.chiedeTitolare() && this.titolare.invalid;
    if (this.opzioni.invalid || titolareMancante || this.gestione.invalid) {
      [this.opzioni, this.titolare, this.gestione].forEach((modulo) => modulo.markAllAsTouched());
      return;
    }
    const { richieste_speciali, ora_arrivo_prevista } = this.opzioni.getRawValue();
    const { lingua, ...gestione } = this.gestione.getRawValue();
    const titolare = this.chiedeTitolare()
      ? { ...this.titolare.getRawValue(), lingua: this.staff() ? lingua : this.lingua.attiva() }
      : undefined;
    this.inCorso.set(true);
    this.errore.set('');
    this.prenotazioni
      .creaPrenotazione({
        ...this.soggiorno(),
        sessione: this.scelta().blocco.sessione,
        titolare,
        richieste_speciali: richieste_speciali || null,
        ora_arrivo_prevista: ora_arrivo_prevista || null,
        ...(this.staff() && {
          ...gestione,
          id_esterno: gestione.id_esterno || null,
          note_interne: gestione.note_interne || null,
        }),
      })
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: ({ id, codice }) =>
          void (this.staff()
            ? this.router.navigate([PERCORSI_STAFF.prenotazioni, id])
            : this.router.navigate([PERCORSI_PUBBLICI.prenotazioni, codice], {
                state: { email: titolare?.email ?? this.auth.utente()?.email },
              })),
        error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
      });
  }

  /** Date e ospiti della ricerca con le scelte fatte qui. */
  private soggiorno(): Omit<PreventivoPayload, 'tipologia_id'> {
    const { arrivo, partenza, adulti, bambini, eta_bambini } = this.scelta().filtri;
    const { pacchetto_id, servizi } = this.opzioni.getRawValue();
    return {
      arrivo,
      partenza,
      adulti,
      bambini,
      eta_bambini,
      codice_sconto: this.codiceApplicato()?.codice,
      pacchetto_id: pacchetto_id ?? undefined,
      servizi: servizi.map((servizio_id) => ({ servizio_id })),
    };
  }
}
