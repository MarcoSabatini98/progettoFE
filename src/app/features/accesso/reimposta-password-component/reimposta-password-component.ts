import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth/auth-service';
import { creaNuovaPasswordForm } from '../../../core/services/auth/nuova-password-form';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { PERCORSI_PUBBLICI } from '../../../core/services/navigazione/navigazione-costanti';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { NuovaPasswordComponent } from '../../../shared/nuova-password-component/nuova-password-component';

/** Nuova password dal link ricevuto per email (?token=...). */
@Component({
  selector: 'app-reimposta-password',
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe, IconaComponent, NuovaPasswordComponent],
  templateUrl: './reimposta-password-component.html',
  styleUrl: '../accesso-pagine.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReimpostaPasswordComponent {
  private readonly auth = inject(AuthService);
  private readonly avvisi = inject(AvvisiService);
  private readonly router = inject(Router);
  private readonly transloco = inject(TranslocoService);
  protected readonly errori = inject(ErroriService);

  /** Token del link nell'email. */
  readonly token = input<string>();

  protected readonly percorsi = PERCORSI_PUBBLICI;
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');
  protected readonly modulo = creaNuovaPasswordForm(inject(NonNullableFormBuilder));

  /**
   * INVIA
   * Salva la nuova password e rimanda all'accesso.
   */
  invia(): void {
    const token = this.token();
    if (!token || this.modulo.invalid) {
      this.modulo.markAllAsTouched();
      return;
    }
    this.inCorso.set(true);
    this.errore.set('');
    this.auth
      .impostaNuovaPassword({ token, password: this.modulo.controls.password.value })
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: () => this.completa(),
        error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
      });
  }

  private completa(): void {
    this.avvisi.mostra(this.transloco.translate('reimposta.fatto'), 'successo');
    void this.router.navigateByUrl(PERCORSI_PUBBLICI.accesso);
  }
}
