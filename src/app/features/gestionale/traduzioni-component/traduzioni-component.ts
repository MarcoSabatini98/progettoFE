import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormControl, FormRecord, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth/auth-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import {
  CAMPI_LUNGHI,
  LIMITI_CONTENUTI,
} from '../../../core/services/contenuti/contenuti-costanti';
import { ContenutiService } from '../../../core/services/contenuti/contenuti-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { LINGUA_PREDEFINITA, NOMI_LINGUE } from '../../../core/services/lingua/lingua-costanti';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { PERMESSI } from '../../../core/services/ruoli/ruoli-costanti';
import { CAMPI_TRADUCIBILI } from '../../../core/services/sistema/sistema-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import {
  EntitaTraducibile,
  TraduzioniPayload,
} from '../../../shared/models/traduzione/traduzione-model';

type ModuloTraduzioni = FormRecord<FormRecord<FormControl<string>>>;

/**
 * Traduzioni di un record (pacchetto, promozione, tipologia...) nelle lingue attive del sito.
 * L'italiano resta nel modulo del record; un testo svuotato toglie la traduzione.
 * Solo per chi gestisce i contenuti.
 */
@Component({
  selector: 'app-traduzioni',
  imports: [ReactiveFormsModule, TranslocoPipe, CampoComponent, IconaComponent],
  templateUrl: './traduzioni-component.html',
  styleUrl: './traduzioni-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TraduzioniComponent {
  private readonly contenuti = inject(ContenutiService);
  private readonly lingua = inject(LinguaService);
  private readonly avvisi = inject(AvvisiService);
  private readonly transloco = inject(TranslocoService);
  protected readonly errori = inject(ErroriService);

  readonly entita = input.required<EntitaTraducibile>();
  readonly entitaId = input.required<number>();

  private readonly auth = inject(AuthService);
  protected readonly gestisce = computed(() => this.auth.haPermessi([PERMESSI.CONTENUTI_GESTISCI]));
  protected readonly nomi = NOMI_LINGUE;
  protected readonly lunghi = CAMPI_LUNGHI;
  protected readonly limite = LIMITI_CONTENUTI.traduzione;
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');
  protected readonly lingue = computed(() =>
    this.lingua.disponibili().filter((codice) => codice !== LINGUA_PREDEFINITA),
  );
  protected readonly campi = computed<readonly string[]>(() => CAMPI_TRADUCIBILI[this.entita()]);
  protected readonly traduzioni = rxResource({
    params: () =>
      this.gestisce() && this.lingue().length
        ? { entita: this.entita(), id: this.entitaId() }
        : undefined,
    stream: ({ params }) => this.contenuti.leggiTraduzioni(params.entita, params.id),
  });
  /** Un gruppo per lingua, un campo per testo: si ricompila con le traduzioni salvate. */
  protected readonly modulo = computed<ModuloTraduzioni>(() => {
    const salvate = this.traduzioni.hasValue() ? this.traduzioni.value() : {};
    return new FormRecord(
      Object.fromEntries(
        this.lingue().map((codice) => [
          codice,
          new FormRecord(
            Object.fromEntries(
              this.campi().map((campo) => [
                campo,
                new FormControl(salvate[codice]?.[campo] ?? '', { nonNullable: true }),
              ]),
            ),
          ),
        ]),
      ),
    );
  });

  /**
   * SALVA
   * Tutte le lingue insieme: il backend tiene i testi pieni e toglie i vuoti.
   */
  salva(): void {
    this.inCorso.set(true);
    this.errore.set('');
    this.contenuti
      .salvaTraduzioni(
        this.entita(),
        this.entitaId(),
        this.modulo().getRawValue() as TraduzioniPayload,
      )
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: (salvate) => {
          this.traduzioni.set(salvate);
          this.avvisi.mostra(this.transloco.translate('gestionale.traduzioni.salvate'), 'successo');
        },
        error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
      });
  }
}
