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
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { Observable, finalize } from 'rxjs';

import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import {
  LUNGHEZZA_RECENSIONE,
  STATI_MODERAZIONE,
} from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { RecensioniService } from '../../../core/services/recensioni/recensioni-service';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import {
  RecensioneInterface,
  StatoRecensione,
} from '../../../shared/models/recensione/recensione-model';

/**
 * Moderazione di una recensione: pubblicarla o rifiutarla (anche cambiando idea dopo)
 * e rispondere all'ospite. La risposta vuota la toglie dal sito.
 */
@Component({
  selector: 'app-gestione-recensione',
  imports: [ReactiveFormsModule, TranslocoPipe, CampoComponent, IconaComponent],
  templateUrl: './gestione-recensione-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class GestioneRecensioneComponent {
  private readonly recensioni = inject(RecensioniService);
  private readonly avvisi = inject(AvvisiService);
  private readonly transloco = inject(TranslocoService);
  protected readonly errori = inject(ErroriService);

  readonly recensione = input.required<RecensioneInterface>();
  readonly salvata = output<RecensioneInterface>();

  /** Gli esiti diversi da quello attuale. */
  protected readonly esiti = computed(() =>
    STATI_MODERAZIONE.filter((stato) => stato !== this.recensione().stato),
  );
  protected readonly lunghezza = LUNGHEZZA_RECENSIONE.risposta;
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    risposta: ['', Validators.maxLength(LUNGHEZZA_RECENSIONE.risposta)],
  });

  constructor() {
    effect(() => this.modulo.reset({ risposta: this.recensione().risposta ?? '' }));
  }

  /**
   * MODERA
   * Pubblica o rifiuta.
   */
  modera(stato: StatoRecensione): void {
    this.invia(
      this.recensioni.moderaRecensione(this.recensione().id, stato),
      `gestionale.recensioni.esiti.${stato}`,
    );
  }

  /**
   * RISPONDI
   * Vuota toglie la risposta; senza modifiche non chiama il backend.
   */
  rispondi(): void {
    if (this.modulo.invalid) {
      this.modulo.markAllAsTouched();
      return;
    }
    const testo = this.modulo.getRawValue().risposta.trim() || null;
    if (testo === this.recensione().risposta) return;
    this.invia(
      this.recensioni.rispondi(this.recensione().id, testo),
      testo ? 'gestionale.recensioni.esiti.risposta' : 'gestionale.recensioni.esiti.rispostaTolta',
    );
  }

  private invia(richiesta: Observable<RecensioneInterface>, avviso: string): void {
    this.inCorso.set(true);
    this.errore.set('');
    richiesta.pipe(finalize(() => this.inCorso.set(false))).subscribe({
      next: (recensione) => {
        this.avvisi.mostra(this.transloco.translate(avviso), 'successo');
        this.salvata.emit(recensione);
      },
      error: (motivo: unknown) => this.errore.set(this.errori.messaggio(motivo)),
    });
  }
}
