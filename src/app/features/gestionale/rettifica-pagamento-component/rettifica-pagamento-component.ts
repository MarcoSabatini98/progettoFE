import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import {
  IMPORTO_MINIMO,
  LUNGHEZZA_MOTIVO,
  METODI_STRUTTURA,
} from '../../../core/services/pagamenti/pagamenti-costanti';
import { PagamentiService } from '../../../core/services/pagamenti/pagamenti-service';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { PagamentoInterface } from '../../../shared/models/pagamento/pagamento-model';

type Rettifica = 'annulla' | 'rimborsa';

/**
 * Correzione di un incasso completato. Annullare vale solo per gli incassi in struttura
 * registrati per errore (non muove denaro); rimborsare restituisce all'ospite, sul provider
 * per Stripe e PayPal. Il backend accetta al massimo quanto pagato in più, salvo `forza`.
 */
@Component({
  selector: 'app-rettifica-pagamento',
  imports: [ReactiveFormsModule, TranslocoPipe, CampoComponent, IconaComponent],
  templateUrl: './rettifica-pagamento-component.html',
  styleUrl: './rettifica-pagamento-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RettificaPagamentoComponent {
  private readonly pagamenti = inject(PagamentiService);
  private readonly avvisi = inject(AvvisiService);
  private readonly transloco = inject(TranslocoService);
  protected readonly errori = inject(ErroriService);

  /** Incasso completato, non un rimborso. */
  readonly pagamento = input.required<PagamentoInterface>();
  /** Annullato o rimborsato: cambia il saldo della prenotazione. */
  readonly rettificato = output();

  protected readonly lunghezzaMotivo = LUNGHEZZA_MOTIVO;
  protected readonly importoMinimo = IMPORTO_MINIMO;
  protected readonly annullabile = computed(() =>
    METODI_STRUTTURA.some((metodo) => metodo === this.pagamento().metodo),
  );
  protected readonly aperta = signal<Rettifica | null>(null);
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    motivo: ['', [Validators.required, Validators.maxLength(LUNGHEZZA_MOTIVO)]],
    importo: [null as number | null],
    forza: [false],
  });

  /**
   * APRI
   */
  apri(rettifica: Rettifica): void {
    this.modulo.reset();
    this.errore.set('');
    this.aperta.set(rettifica);
  }

  /**
   * CONFERMA
   * Rimborso senza importo = tutto l'incasso.
   */
  conferma(rettifica: Rettifica): void {
    if (this.modulo.invalid) {
      this.modulo.markAllAsTouched();
      return;
    }
    const { motivo, importo, forza } = this.modulo.getRawValue();
    const { id } = this.pagamento();
    const richiesta =
      rettifica === 'annulla'
        ? this.pagamenti.annullaPagamento(id, motivo)
        : this.pagamenti.rimborsaPagamento(id, { motivo, importo: importo ?? undefined, forza });
    this.inCorso.set(true);
    this.errore.set('');
    richiesta.pipe(finalize(() => this.inCorso.set(false))).subscribe({
      next: () => {
        this.aperta.set(null);
        this.avvisi.mostra(
          this.transloco.translate(`gestionale.rettifica.esiti.${rettifica}`),
          'successo',
        );
        this.rettificato.emit();
      },
      error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
    });
  }
}
