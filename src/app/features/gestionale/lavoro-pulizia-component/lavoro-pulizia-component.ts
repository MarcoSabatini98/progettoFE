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
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth/auth-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import {
  LUNGHEZZA_PULIZIA,
  TRANSIZIONI_PULIZIA,
} from '../../../core/services/pulizie/pulizie-costanti';
import { PulizieService } from '../../../core/services/pulizie/pulizie-service';
import { PERMESSI } from '../../../core/services/ruoli/ruoli-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import {
  AttivitaPuliziaInterface,
  AvanzamentoPuliziaPayload,
  StatoAttivitaPulizia,
} from '../../../shared/models/attivita-pulizia/attivita-pulizia-model';

/**
 * Lavoro dell'addetto su un'attività: spunta la checklist, scrive le note e la fa avanzare
 * (inizia, finita, verificata...). Chi non può lavorarci la vede in sola lettura.
 */
@Component({
  selector: 'app-lavoro-pulizia',
  imports: [ReactiveFormsModule, TranslocoPipe, CampoComponent],
  templateUrl: './lavoro-pulizia-component.html',
  styleUrl: './lavoro-pulizia-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class LavoroPuliziaComponent {
  private readonly pulizie = inject(PulizieService);
  private readonly auth = inject(AuthService);
  protected readonly errori = inject(ErroriService);

  readonly attivita = input.required<AttivitaPuliziaInterface>();
  readonly aggiornata = output<AttivitaPuliziaInterface>();

  private readonly gestore = this.auth.haPermessi([PERMESSI.PULIZIE_GESTISCI]);
  protected readonly lunghezza = LUNGHEZZA_PULIZIA;
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');
  protected readonly note = new FormControl('', {
    nonNullable: true,
    validators: Validators.maxLength(LUNGHEZZA_PULIZIA.note),
  });
  /** L'addetto lavora sulle sue attività o su quelle libere; chi gestisce su tutte. */
  protected readonly puoLavorare = computed(() => {
    const assegnata = this.attivita().assegnata_a;
    const mia = !assegnata || assegnata === this.auth.utente()?.id;
    return this.auth.haPermessi([PERMESSI.PULIZIE_ESEGUI]) && (mia || this.gestore);
  });
  /** Si spunta solo mentre la pulizia è in corso. */
  protected readonly spuntabile = computed(
    () => this.puoLavorare() && this.attivita().stato === 'in_corso',
  );
  /** Passaggi di stato proposti: verifica e ispezione respinta solo a chi gestisce. */
  protected readonly passaggi = computed(() =>
    Object.entries(TRANSIZIONI_PULIZIA[this.attivita().stato])
      .filter(([, soloGestore]) => !soloGestore || this.gestore)
      .map(([stato]) => stato as StatoAttivitaPulizia),
  );

  constructor() {
    effect(() => this.note.reset(this.attivita().note ?? ''));
  }

  /**
   * SPUNTA
   * Il backend abbina le voci per posizione: si manda la checklist intera.
   */
  spunta(indice: number, fatto: boolean): void {
    const checklist = (this.attivita().checklist ?? []).map((riga, posizione) =>
      posizione === indice ? { ...riga, fatto } : riga,
    );
    this.avanza({ checklist });
  }

  /**
   * PASSA A
   */
  passaA(stato: StatoAttivitaPulizia): void {
    this.avanza({ stato });
  }

  /**
   * SALVA NOTE
   */
  salvaNote(): void {
    if (this.note.invalid) return;
    this.avanza({ note: this.note.value || null });
  }

  private avanza(dati: AvanzamentoPuliziaPayload): void {
    this.inCorso.set(true);
    this.errore.set('');
    this.pulizie
      .avanzaAttivita(this.attivita().id, dati)
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: (attivita) => this.aggiornata.emit(attivita),
        error: (motivo: unknown) => this.errore.set(this.errori.messaggio(motivo)),
      });
  }
}
