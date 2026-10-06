import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../../core/services/auth/auth-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { PagamentiService } from '../../../core/services/pagamenti/pagamenti-service';
import { PrenotazioniService } from '../../../core/services/prenotazioni/prenotazioni-service';
import { RecensioniService } from '../../../core/services/recensioni/recensioni-service';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { ContoPrenotazioneComponent } from '../../../shared/conto-prenotazione-component/conto-prenotazione-component';
import { DettagliPrenotazioneComponent } from '../../../shared/dettagli-prenotazione-component/dettagli-prenotazione-component';
import { PagaOnlinePayload } from '../../../shared/models/pagamento/pagamento-model';
import { RecensioneCreaPayload } from '../../../shared/models/recensione/recensione-model';
import { ModuloRecensioneComponent } from '../../../shared/modulo-recensione-component/modulo-recensione-component';
import { PagamentoPrenotazioneComponent } from '../../../shared/pagamento-prenotazione-component/pagamento-prenotazione-component';

/**
 * Prenotazione aperta col codice (/prenotazioni/:codice): dettagli, conto, pagamento e,
 * a soggiorno concluso, la recensione (il link arriva nell'email dopo la partenza).
 * L'email del titolare arriva dalla conferma o dall'account; altrimenti la si chiede.
 */
@Component({
  selector: 'app-prenotazione',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    CampoComponent,
    ContoPrenotazioneComponent,
    DettagliPrenotazioneComponent,
    ModuloRecensioneComponent,
    PagamentoPrenotazioneComponent,
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
  private readonly recensioni = inject(RecensioniService);
  protected readonly errori = inject(ErroriService);

  /** Codice dal percorso. */
  readonly codice = input.required<string>();

  private readonly emailIniziale =
    (inject(Location).getState() as { email?: string } | null)?.email ??
    inject(AuthService).utente()?.email;

  protected readonly modulo = inject(NonNullableFormBuilder).group({
    email: [this.emailIniziale ?? '', [Validators.required, Validators.email]],
  });
  /** Email con cui si è aperta la prenotazione: serve anche per pagare e recensire. */
  protected readonly email = signal(this.emailIniziale);
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

  /** Apre Stripe o PayPal a nome di chi ha aperto la prenotazione. */
  protected readonly avvia = (pagamento: PagaOnlinePayload) =>
    this.pagamenti.pagaPerCodice({ ...this.accesso(), ...pagamento });

  protected readonly recensisci = (dati: RecensioneCreaPayload) =>
    this.recensioni.creaRecensionePerCodice({ ...this.accesso(), ...dati });

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

  /** Il pagamento e la recensione compaiono solo a prenotazione aperta, quindi con l'email. */
  private accesso() {
    return { codice: this.codice(), email: this.email() ?? '' };
  }
}
