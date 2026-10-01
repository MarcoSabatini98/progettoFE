import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { debounceTime, finalize, map } from 'rxjs';

import { ATTESA_RICERCA_MS, LETTERE_MINIME_RICERCA } from '../../../core/services/api/api-costanti';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import {
  LUNGHEZZA_MOTIVO_ESENZIONE,
  OSPITI_SUGGERITI,
} from '../../../core/services/ospiti/ospiti-costanti';
import { OspitiService } from '../../../core/services/ospiti/ospiti-service';
import {
  STATI_CHIUSI,
  TIPI_ALLOGGIATO,
} from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { LUNGHEZZA_DATI_PERSONALI } from '../../../core/services/utenti/utenti-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import {
  OspiteInListaInterface,
  OspiteSoggiornoInterface,
  RigaOspiteInListaInterface,
  RigaOspitePayload,
} from '../../../shared/models/prenotazione-ospite/prenotazione-ospite-model';
import {
  PrenotazioneInterface,
  StatoPrenotazione,
} from '../../../shared/models/prenotazione/prenotazione-model';

/**
 * Chi soggiorna davvero: lo staff compone la lista (anagrafiche già registrate
 * o nuove), sceglie il ruolo nella schedina e le esenzioni, poi la salva tutta insieme.
 */
@Component({
  selector: 'app-ospiti-soggiorno',
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe, CampoComponent, IconaComponent],
  templateUrl: './ospiti-soggiorno-component.html',
  styleUrl: './ospiti-soggiorno-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class OspitiSoggiornoComponent {
  private readonly ospiti = inject(OspitiService);
  private readonly avvisi = inject(AvvisiService);
  private readonly transloco = inject(TranslocoService);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly errori = inject(ErroriService);

  readonly prenotazione =
    input.required<Pick<PrenotazioneInterface, 'id' | 'stato' | 'adulti' | 'bambini'>>();
  /** Salvando cambia la tassa di soggiorno: la prenotazione va riletta. */
  readonly aggiornati = output();

  protected readonly tipi = TIPI_ALLOGGIATO;
  protected readonly scheda = PERCORSI_STAFF.ospiti;
  protected readonly lunghezza = {
    ...LUNGHEZZA_DATI_PERSONALI,
    motivo: LUNGHEZZA_MOTIVO_ESENZIONE,
  };
  protected readonly elenco = rxResource({
    params: () => this.prenotazione().id,
    stream: ({ params: id }) => this.ospiti.elencaOspitiPrenotazione(id),
  });
  /** Lista in modifica: riparte da quella salvata ogni volta che si rilegge. */
  protected readonly righe = this.fb.array<ReturnType<typeof this.riga>>([]);
  protected readonly modificabile = computed(
    () => !(STATI_CHIUSI as readonly StatoPrenotazione[]).includes(this.prenotazione().stato),
  );

  protected readonly cerca = new FormControl('', { nonNullable: true });
  private readonly cercato = toSignal(
    this.cerca.valueChanges.pipe(
      debounceTime(ATTESA_RICERCA_MS),
      map((testo) => testo.trim()),
    ),
    { initialValue: '' },
  );
  protected readonly trovati = rxResource({
    params: () => {
      const cerca = this.cercato();
      return cerca.length < LETTERE_MINIME_RICERCA ? undefined : cerca;
    },
    stream: ({ params: cerca }) =>
      this.ospiti
        .elencaOspiti({ cerca, perPagina: OSPITI_SUGGERITI })
        .pipe(map((pagina) => pagina.elementi)),
  });
  protected readonly nuovo = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(LUNGHEZZA_DATI_PERSONALI.nome)]],
    cognome: ['', [Validators.required, Validators.maxLength(LUNGHEZZA_DATI_PERSONALI.cognome)]],
  });
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');

  constructor() {
    effect(() => {
      if (!this.elenco.hasValue()) return;
      this.compila(this.elenco.value());
      if (!this.modificabile()) this.righe.disable();
    });
  }

  /** Ospiti quanti ne prevede la prenotazione: non se ne aggiungono altri. */
  protected piena(): boolean {
    const { adulti, bambini } = this.prenotazione();
    return this.righe.length >= adulti + bambini;
  }

  /** Già nella lista: non si propone di nuovo. */
  protected presente(id: number): boolean {
    return this.righe.controls.some((riga) => riga.controls.ospite.value.id === id);
  }

  /**
   * AGGIUNGI
   * In coda alla lista; con più ospiti chi era da solo diventa capofamiglia.
   */
  aggiungi(ospite: OspiteInListaInterface): void {
    for (const { controls } of this.righe.controls) {
      if (controls.tipo_alloggiato.value === 'ospite_singolo') {
        controls.tipo_alloggiato.setValue('capofamiglia');
      }
    }
    this.righe.push(
      this.riga({
        ospite,
        tipo_alloggiato: this.righe.length ? 'familiare' : 'ospite_singolo',
        esente_tassa: false,
        motivo_esenzione: null,
      }),
    );
    this.righe.markAsDirty();
  }

  /**
   * AGGIUNGI NUOVO
   * Ospite senza anagrafica: si crea salvando la lista.
   */
  aggiungiNuovo(): void {
    if (this.nuovo.invalid) {
      this.nuovo.markAllAsTouched();
      return;
    }
    this.aggiungi(this.nuovo.getRawValue());
    this.nuovo.reset();
  }

  /**
   * TOGLI
   */
  togli(indice: number): void {
    this.righe.removeAt(indice);
    this.righe.markAsDirty();
  }

  /**
   * SALVA
   * Sostituisce la lista: le anagrafiche registrate si mandano col solo id.
   */
  salva(): void {
    this.inCorso.set(true);
    this.errore.set('');
    this.ospiti
      .impostaOspitiPrenotazione(this.prenotazione().id, this.righe.getRawValue().map(daSalvare))
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: (ospiti) => {
          this.elenco.set(ospiti);
          this.avvisi.mostra(
            this.transloco.translate('gestionale.ospitiSoggiorno.salvati'),
            'successo',
          );
          this.aggiornati.emit();
        },
        error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
      });
  }

  private riga(riga: RigaOspiteInListaInterface) {
    return this.fb.group({
      ospite: this.fb.control(riga.ospite),
      tipo_alloggiato: this.fb.control(riga.tipo_alloggiato),
      esente_tassa: this.fb.control(riga.esente_tassa),
      motivo_esenzione: this.fb.control(riga.motivo_esenzione ?? '', [
        Validators.maxLength(LUNGHEZZA_MOTIVO_ESENZIONE),
      ]),
    });
  }

  private compila(ospiti: OspiteSoggiornoInterface[]): void {
    this.righe.clear();
    for (const ospite of ospiti) {
      const { tipo_alloggiato, esente_tassa, motivo_esenzione } = ospite;
      this.righe.push(this.riga({ ospite, tipo_alloggiato, esente_tassa, motivo_esenzione }));
    }
    this.righe.markAsPristine();
  }
}

// Il motivo vale solo per chi è esente; un campo vuoto non è un motivo.
function daSalvare({
  ospite,
  esente_tassa,
  motivo_esenzione,
  ...riga
}: RigaOspiteInListaInterface): RigaOspitePayload {
  return {
    ...riga,
    ospite:
      ospite.id === undefined ? { nome: ospite.nome, cognome: ospite.cognome } : { id: ospite.id },
    esente_tassa,
    motivo_esenzione: (esente_tassa && motivo_esenzione) || null,
  };
}
