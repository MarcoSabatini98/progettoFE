import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth/auth-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { PERCORSI_PUBBLICI } from '../../../core/services/navigazione/navigazione-costanti';
import { NavigazioneService } from '../../../core/services/navigazione/navigazione-service';
import { CampoComponent } from '../../../shared/campo-component/campo-component';

/** Accesso con email e password, per ospiti e staff. */
@Component({
  selector: 'app-accesso',
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe, CampoComponent],
  templateUrl: './accesso-component.html',
  styleUrls: ['../accesso-pagine.css', './accesso-component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessoComponent {
  private readonly auth = inject(AuthService);
  private readonly navigazione = inject(NavigazioneService);
  private readonly router = inject(Router);
  protected readonly errori = inject(ErroriService);

  /** Pagina da riaprire dopo l'accesso: la mette authGuard nei parametri. */
  readonly ritorno = input<string>();

  protected readonly percorsi = PERCORSI_PUBBLICI;
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  /**
   * INVIA
   * Con campi validi apre la sessione e torna alla pagina richiesta o a quella iniziale.
   */
  invia(): void {
    if (this.modulo.invalid) {
      this.modulo.markAllAsTouched();
      return;
    }
    this.inCorso.set(true);
    this.errore.set('');
    this.auth
      .accedi(this.modulo.getRawValue())
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: () =>
          void this.router.navigateByUrl(this.ritorno() || this.navigazione.paginaIniziale()),
        error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
      });
  }
}
