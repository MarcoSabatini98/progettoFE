import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { Observable, finalize } from 'rxjs';

import { ErroriService } from '../../../core/services/errori/errori-service';
import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import { LUNGHEZZA_PULIZIA, TIPI_PULIZIA } from '../../../core/services/pulizie/pulizie-costanti';
import { PulizieService } from '../../../core/services/pulizie/pulizie-service';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { TipoPulizia } from '../../../shared/models/attivita-pulizia/attivita-pulizia-model';
import { ChecklistModelloInterface } from '../../../shared/models/checklist-modello/checklist-modello-model';

/**
 * Voci della checklist per tipo di pulizia: si copiano nelle nuove attività.
 * Disattivare una voce la toglie dalle prossime senza perderla.
 */
@Component({
  selector: 'app-checklist-pulizie',
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe, CampoComponent, IconaComponent],
  templateUrl: './checklist-pulizie-component.html',
  styleUrl: './checklist-pulizie-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class ChecklistPulizieComponent {
  private readonly pulizie = inject(PulizieService);
  protected readonly errori = inject(ErroriService);

  protected readonly elenco = PERCORSI_STAFF.pulizie;
  protected readonly tipi = TIPI_PULIZIA;
  protected readonly lunghezza = LUNGHEZZA_PULIZIA;
  protected readonly voci = rxResource({ stream: () => this.pulizie.elencaVoci() });
  /** Le voci senza tipo (dei primi dati) valgono per tutti: gruppo a parte solo se ci sono. */
  protected readonly gruppi = computed(() => {
    const voci = this.voci.value() ?? [];
    return [null, ...this.tipi]
      .map((tipo) => ({ tipo, voci: voci.filter((voce) => voce.tipo_pulizia === tipo) }))
      .filter((gruppo) => gruppo.tipo !== null || gruppo.voci.length);
  });
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');
  protected readonly nuova = inject(NonNullableFormBuilder).group({
    voce: ['', [Validators.required, Validators.maxLength(LUNGHEZZA_PULIZIA.voce)]],
    tipo_pulizia: ['partenza' as TipoPulizia],
  });

  /**
   * AGGIUNGI
   * In fondo al suo tipo.
   */
  aggiungi(): void {
    if (this.nuova.invalid) {
      this.nuova.markAllAsTouched();
      return;
    }
    const dati = this.nuova.getRawValue();
    const stessoTipo = (this.voci.value() ?? []).filter(
      (voce) => voce.tipo_pulizia === dati.tipo_pulizia,
    );
    const ordine = Math.max(0, ...stessoTipo.map((voce) => voce.ordine + 1));
    this.invia(this.pulizie.aggiungiVoce({ ...dati, ordine }), () =>
      this.nuova.reset({ voce: '', tipo_pulizia: dati.tipo_pulizia }),
    );
  }

  /**
   * ATTIVA
   */
  attiva(voce: ChecklistModelloInterface, attiva: boolean): void {
    this.invia(this.pulizie.aggiornaVoce(voce.id, { attiva }));
  }

  /**
   * ELIMINA
   * Le attività già create tengono la loro copia.
   */
  elimina(voce: ChecklistModelloInterface): void {
    this.invia(this.pulizie.eliminaVoce(voce.id));
  }

  /** Esegue e ricarica le voci. */
  private invia(richiesta: Observable<unknown>, fatto?: () => void): void {
    this.inCorso.set(true);
    this.errore.set('');
    richiesta.pipe(finalize(() => this.inCorso.set(false))).subscribe({
      next: () => {
        fatto?.();
        this.voci.reload();
      },
      error: (motivo: unknown) => this.errore.set(this.errori.messaggio(motivo)),
    });
  }
}
