import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth/auth-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { PERCORSI_PUBBLICI } from '../../../core/services/navigazione/navigazione-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';

/** Eliminazione dell'account cliente: si conferma con la password, senza finestre del browser. */
@Component({
  selector: 'app-elimina-account',
  imports: [ReactiveFormsModule, TranslocoPipe, CampoComponent],
  templateUrl: './elimina-account-component.html',
  styleUrls: ['../profilo-sezioni.css', './elimina-account-component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EliminaAccountComponent {
  private readonly auth = inject(AuthService);
  private readonly avvisi = inject(AvvisiService);
  private readonly router = inject(Router);
  private readonly transloco = inject(TranslocoService);
  protected readonly errori = inject(ErroriService);

  protected readonly conferma = signal(false);
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    password: ['', Validators.required],
  });

  protected annulla(): void {
    this.conferma.set(false);
    this.errore.set('');
    this.modulo.reset();
  }

  /**
   * ELIMINA
   * Il backend rifiuta se ci sono prenotazioni in corso o future (PRENOTAZIONI_ATTIVE).
   */
  elimina(): void {
    if (this.modulo.invalid) {
      this.modulo.markAllAsTouched();
      return;
    }
    this.inCorso.set(true);
    this.errore.set('');
    this.auth
      .eliminaAccount(this.modulo.controls.password.value)
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: () => this.completa(),
        error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
      });
  }

  private completa(): void {
    this.avvisi.mostra(this.transloco.translate('eliminaAccount.fatto'), 'successo');
    void this.router.navigateByUrl(PERCORSI_PUBBLICI.home);
  }
}
