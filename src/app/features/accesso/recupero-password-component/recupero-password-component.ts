import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth/auth-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { PERCORSI_PUBBLICI } from '../../../core/services/navigazione/navigazione-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';

/**
 * Richiesta del link per reimpostare la password. La conferma è sempre la stessa,
 * che l'email sia registrata o no: non si rivela chi ha un account.
 */
@Component({
  selector: 'app-recupero-password',
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe, CampoComponent],
  templateUrl: './recupero-password-component.html',
  styleUrls: ['../accesso-pagine.css', './recupero-password-component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecuperoPasswordComponent {
  private readonly auth = inject(AuthService);
  protected readonly errori = inject(ErroriService);

  protected readonly accesso = PERCORSI_PUBBLICI.accesso;
  protected readonly inCorso = signal(false);
  protected readonly inviata = signal(false);
  protected readonly errore = signal('');
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
  });

  /**
   * INVIA
   */
  invia(): void {
    if (this.modulo.invalid) {
      this.modulo.markAllAsTouched();
      return;
    }
    this.inCorso.set(true);
    this.errore.set('');
    this.auth
      .richiediResetPassword(this.modulo.controls.email.value)
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: () => this.inviata.set(true),
        error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
      });
  }
}
