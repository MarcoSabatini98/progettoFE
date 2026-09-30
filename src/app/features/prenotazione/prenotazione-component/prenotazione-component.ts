import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, DOCUMENT, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { finalize, forkJoin } from 'rxjs';

import { AuthService } from '../../../core/services/auth/auth-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { PagamentiService } from '../../../core/services/pagamenti/pagamenti-service';
import { PrenotazioniService } from '../../../core/services/prenotazioni/prenotazioni-service';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { MetodoOnline } from '../../../shared/models/pagamento/pagamento-model';
import { DataPipe } from '../../../shared/pipes/data-pipe';
import { PrezzoPipe } from '../../../shared/pipes/prezzo-pipe';
import { RiepilogoPrezzoComponent } from '../../../shared/riepilogo-prezzo-component/riepilogo-prezzo-component';

/**
 * Prenotazione aperta col codice (/prenotazioni/:codice): dettagli, conto e pagamento.
 * L'email del titolare arriva dalla conferma o dall'account; altrimenti la si chiede.
 */
@Component({
  selector: 'app-prenotazione',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    CampoComponent,
    IconaComponent,
    DataPipe,
    PrezzoPipe,
    RiepilogoPrezzoComponent,
  ],
  templateUrl: './prenotazione-component.html',
  styleUrl: './prenotazione-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class PrenotazioneComponent {
  private readonly lingua = inject(LinguaService);
  private readonly pagamenti = inject(PagamentiService);
  private readonly prenotazioni = inject(PrenotazioniService);
  private readonly finestra = inject(DOCUMENT).defaultView;
  protected readonly errori = inject(ErroriService);

  /** Codice dal percorso. */
  readonly codice = input.required<string>();

  private readonly emailIniziale =
    (inject(Location).getState() as { email?: string } | null)?.email ??
    inject(AuthService).utente()?.email;

  protected readonly modulo = inject(NonNullableFormBuilder).group({
    email: [this.emailIniziale ?? '', [Validators.required, Validators.email]],
  });
  /** Email con cui si è aperta la prenotazione: serve anche per pagare. */
  protected readonly email = signal(this.emailIniziale);
  protected readonly inPagamento = signal<MetodoOnline | undefined>(undefined);
  protected readonly errorePagamento = signal('');
  protected readonly dati = rxResource({
    params: () => {
      const email = this.email();
      return email ? { codice: this.codice(), email, lingua: this.lingua.attiva() } : undefined;
    },
    stream: ({ params: { codice, email } }) =>
      forkJoin({
        prenotazione: this.prenotazioni.accediPerCodice({ codice, email }),
        pagamento: this.pagamenti.leggiRiepilogoPerCodice({ codice, email }),
      }),
  });

  /**
   * APRI
   */
  apri(): void {
    if (this.modulo.invalid) {
      this.modulo.markAllAsTouched();
      return;
    }
    this.email.set(this.modulo.getRawValue().email);
  }

  /**
   * PAGA
   * Apre la pagina di Stripe o PayPal, che poi rimanda all'esito del pagamento.
   */
  paga(metodo: MetodoOnline): void {
    const email = this.email();
    if (!email) {
      return;
    }
    this.inPagamento.set(metodo);
    this.errorePagamento.set('');
    this.pagamenti
      .pagaPerCodice({ codice: this.codice(), email, metodo })
      .pipe(finalize(() => this.inPagamento.set(undefined)))
      .subscribe({
        next: ({ url }) => this.finestra?.location.assign(url),
        error: (errore: unknown) => this.errorePagamento.set(this.errori.messaggio(errore)),
      });
  }
}
