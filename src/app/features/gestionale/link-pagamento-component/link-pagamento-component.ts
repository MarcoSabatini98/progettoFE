import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { ErroriService } from '../../../core/services/errori/errori-service';
import { IMPORTO_MINIMO } from '../../../core/services/pagamenti/pagamenti-costanti';
import { PagamentiService } from '../../../core/services/pagamenti/pagamenti-service';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { LinkCopiabileComponent } from '../../../shared/link-copiabile-component/link-copiabile-component';
import { MetodoOnline } from '../../../shared/models/pagamento/pagamento-model';
import { RiepilogoPagamentoInterface } from '../../../shared/models/riepilogo-pagamento/riepilogo-pagamento-model';

/**
 * Link di pagamento con carta o PayPal per l'ospite, da copiare o mandare per email.
 * Senza importo vale quanto resta da pagare ora. Non compare se il server non ha metodi online.
 */
@Component({
  selector: 'app-link-pagamento',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    CampoComponent,
    IconaComponent,
    LinkCopiabileComponent,
  ],
  templateUrl: './link-pagamento-component.html',
  styleUrl: './link-pagamento-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[hidden]': '!metodi().length' },
})
export class LinkPagamentoComponent {
  private readonly pagamenti = inject(PagamentiService);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly errori = inject(ErroriService);

  readonly prenotazioneId = input.required<number>();
  readonly riepilogo = input.required<RiepilogoPagamentoInterface>();

  protected readonly metodi = computed(() => this.riepilogo().metodi_online);
  protected readonly importoMinimo = IMPORTO_MINIMO;
  protected readonly aperto = signal(false);
  protected readonly url = signal('');
  protected readonly inviato = signal(false);
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');
  protected readonly modulo = this.fb.group({
    metodo: this.fb.control<MetodoOnline | undefined>(undefined),
    importo: [null as number | null, Validators.min(IMPORTO_MINIMO)],
    invia_email: [false],
  });

  /**
   * APRI
   * Propone il primo metodo attivo e un nuovo link.
   */
  apri(): void {
    this.modulo.reset({ metodo: this.metodi()[0] });
    this.url.set('');
    this.errore.set('');
    this.aperto.set(true);
  }

  /**
   * CREA
   */
  crea(): void {
    const { metodo, importo, invia_email } = this.modulo.getRawValue();
    if (this.modulo.invalid || !metodo) {
      this.modulo.markAllAsTouched();
      return;
    }
    this.inCorso.set(true);
    this.errore.set('');
    this.pagamenti
      .avviaOnline(this.prenotazioneId(), { metodo, importo: importo ?? undefined, invia_email })
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: ({ url }) => {
          this.inviato.set(invia_email);
          this.url.set(url);
        },
        error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
      });
  }
}
