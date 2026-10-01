import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { ErroriService } from '../../../core/services/errori/errori-service';
import {
  IMPORTO_MINIMO,
  LUNGHEZZE_INCASSO,
  METODI_STRUTTURA,
  TIPI_INCASSO,
} from '../../../core/services/pagamenti/pagamenti-costanti';
import { PagamentiService } from '../../../core/services/pagamenti/pagamenti-service';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { MetodoStruttura, TipoIncasso } from '../../../shared/models/pagamento/pagamento-model';

const TIPO_PROPOSTO: TipoIncasso = 'saldo';
const METODO_PROPOSTO: MetodoStruttura = 'contanti';

/** Incasso in struttura o bonifico ricevuto: l'importo proposto è quanto resta da pagare ora. */
@Component({
  selector: 'app-registra-incasso',
  imports: [ReactiveFormsModule, TranslocoPipe, CampoComponent, IconaComponent],
  templateUrl: './registra-incasso-component.html',
  styleUrl: './registra-incasso-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistraIncassoComponent {
  private readonly pagamenti = inject(PagamentiService);
  protected readonly errori = inject(ErroriService);

  readonly prenotazioneId = input.required<number>();
  /** Quanto resta da pagare ora: 0 = nessuna proposta. */
  readonly daPagare = input(0);
  readonly registrato = output();

  protected readonly scelte = { tipi: TIPI_INCASSO, metodi: METODI_STRUTTURA };
  protected readonly lunghezza = LUNGHEZZE_INCASSO;
  protected readonly importoMinimo = IMPORTO_MINIMO;
  protected readonly aperto = signal(false);
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    tipo: [TIPO_PROPOSTO],
    metodo: [METODO_PROPOSTO],
    importo: [null as number | null, [Validators.required, Validators.min(IMPORTO_MINIMO)]],
    riferimento: ['', Validators.maxLength(LUNGHEZZE_INCASSO.riferimento)],
    documento_fiscale: ['', Validators.maxLength(LUNGHEZZE_INCASSO.documentoFiscale)],
    note: ['', Validators.maxLength(LUNGHEZZE_INCASSO.note)],
  });

  /**
   * APRI
   */
  apri(): void {
    this.modulo.reset({ importo: this.daPagare() || null });
    this.errore.set('');
    this.aperto.set(true);
  }

  /**
   * REGISTRA
   * I testi vuoti partono come null.
   */
  registra(): void {
    if (this.modulo.invalid) {
      this.modulo.markAllAsTouched();
      return;
    }
    const { importo, riferimento, documento_fiscale, note, ...scelta } = this.modulo.getRawValue();
    this.inCorso.set(true);
    this.errore.set('');
    this.pagamenti
      .registraPagamento(this.prenotazioneId(), {
        ...scelta,
        importo: Number(importo),
        riferimento: riferimento || null,
        documento_fiscale: documento_fiscale || null,
        note: note || null,
      })
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: () => {
          this.aperto.set(false);
          this.registrato.emit();
        },
        error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
      });
  }
}
