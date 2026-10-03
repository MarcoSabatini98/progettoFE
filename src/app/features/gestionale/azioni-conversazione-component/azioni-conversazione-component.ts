import { DOCUMENT } from '@angular/common';
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
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { Observable, finalize } from 'rxjs';

import { salvaFile } from '../../../core/services/api/salva-file';
import { AuthService } from '../../../core/services/auth/auth-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { GRUPPI_SQUADRA, TITOLO_MAX } from '../../../core/services/chat/chat-costanti';
import { ChatService } from '../../../core/services/chat/chat-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { ConversazioneInterface } from '../../../shared/models/conversazione/conversazione-model';

/** Quale modulo è aperto sotto i pulsanti. */
type Pannello = 'rinomina' | 'aggiungi' | null;

/**
 * Comandi della conversazione: l'assistenza si prende e si rilascia, i gruppi
 * (non di squadra) si rinominano, si allargano e si lasciano. Tutte si chiudono
 * e si esportano in PDF.
 */
@Component({
  selector: 'app-azioni-conversazione',
  imports: [ReactiveFormsModule, TranslocoPipe, CampoComponent, IconaComponent],
  templateUrl: './azioni-conversazione-component.html',
  styleUrl: './azioni-conversazione-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AzioniConversazioneComponent {
  private readonly chat = inject(ChatService);
  private readonly router = inject(Router);
  private readonly avvisi = inject(AvvisiService);
  private readonly transloco = inject(TranslocoService);
  private readonly documento = inject(DOCUMENT);
  private readonly auth = inject(AuthService);
  protected readonly errori = inject(ErroriService);

  readonly conversazione = input.required<ConversazioneInterface>();
  /** Il backend risponde con il dettaglio aggiornato. */
  readonly cambiata = output<ConversazioneInterface>();

  protected readonly titoloMax = TITOLO_MAX;
  protected readonly pannello = signal<Pannello>(null);
  protected readonly inCorso = signal(false);
  protected readonly mioId = computed(() => this.auth.utente()?.id ?? null);
  protected readonly mia = computed(() => this.conversazione().assegnata_a === this.mioId());
  /** I gruppi di squadra seguono i ruoli: non si toccano a mano. */
  protected readonly gruppoLibero = computed(() => {
    const titolo = this.conversazione().titolo;
    return Boolean(titolo) && !Object.values<string | null>(GRUPPI_SQUADRA).includes(titolo);
  });
  /** Si caricano solo aprendo "aggiungi". */
  protected readonly colleghi = rxResource({
    params: () => (this.pannello() === 'aggiungi' ? true : undefined),
    stream: () => this.chat.elencaColleghi(),
  });
  protected readonly daAggiungere = computed(() => {
    const presenti = new Set(this.conversazione().partecipanti?.map((p) => p.id));
    return (this.colleghi.value() ?? []).filter((collega) => !presenti.has(collega.id));
  });
  private readonly campi = inject(NonNullableFormBuilder);
  protected readonly titolo = this.campi.control('', [
    Validators.required,
    Validators.maxLength(TITOLO_MAX),
  ]);
  protected readonly collega = this.campi.control<number | null>(null, Validators.required);
  /** I gruppi rendono i form di Angular: ngSubmit senza ricaricare la pagina. */
  protected readonly moduloRinomina = new FormGroup({ titolo: this.titolo });
  protected readonly moduloAggiungi = new FormGroup({ collega: this.collega });

  /**
   * APRI PANNELLO
   * Rinomina parte dal nome attuale.
   */
  apri(pannello: Pannello): void {
    this.titolo.setValue(this.conversazione().titolo ?? '');
    this.collega.reset();
    this.pannello.update((aperto) => (aperto === pannello ? null : pannello));
  }

  /**
   * ASSEGNA
   * Prendi in carico (a sé) o rilascia (null).
   */
  assegna(utenteId: number | null): void {
    const chiave = utenteId ? 'presa' : 'rilasciata';
    this.esegui(this.chat.assegna(this.uuid(), utenteId), chiave);
  }

  cambiaStato(): void {
    const stato = this.conversazione().stato === 'aperta' ? 'chiusa' : 'aperta';
    this.esegui(this.chat.impostaStato(this.uuid(), stato), stato);
  }

  rinomina(): void {
    const titolo = this.titolo.value.trim();
    if (!titolo) {
      this.titolo.markAsTouched();
      return;
    }
    this.esegui(this.chat.rinominaGruppo(this.uuid(), titolo), 'rinominata');
  }

  aggiungi(): void {
    const id = this.collega.value;
    if (id === null) {
      this.collega.markAsTouched();
      return;
    }
    this.esegui(this.chat.aggiungiPartecipante(this.uuid(), id), 'aggiunto');
  }

  /**
   * ESCI
   * Dopo non si vede più: si torna all'elenco.
   */
  esci(): void {
    this.inCorso.set(true);
    this.chat
      .esci(this.uuid())
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: () => {
          this.avviso('uscito');
          this.router.navigateByUrl(PERCORSI_STAFF.chat);
        },
        error: (motivo: unknown) => this.avvisi.mostra(this.errori.messaggio(motivo), 'errore'),
      });
  }

  esportaPdf(): void {
    this.chat.esportaPdf(this.uuid()).subscribe({
      next: (file) => salvaFile(this.documento, file, `chat-${this.uuid()}.pdf`),
      error: (motivo: unknown) => this.avvisi.mostra(this.errori.messaggio(motivo), 'errore'),
    });
  }

  private uuid(): string {
    return this.conversazione().uuid;
  }

  private esegui(richiesta: Observable<ConversazioneInterface>, esito: string): void {
    this.inCorso.set(true);
    richiesta.pipe(finalize(() => this.inCorso.set(false))).subscribe({
      next: (dettaglio) => {
        this.pannello.set(null);
        this.avviso(esito);
        this.cambiata.emit(dettaglio);
      },
      error: (motivo: unknown) => this.avvisi.mostra(this.errori.messaggio(motivo), 'errore'),
    });
  }

  private avviso(esito: string): void {
    this.avvisi.mostra(
      this.transloco.translate(`gestionale.chat.azioni.esiti.${esito}`),
      'successo',
    );
  }
}
