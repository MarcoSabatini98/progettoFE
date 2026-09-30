import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { CIFRE_CODICE_VERIFICA } from '../../../core/services/auth/auth-costanti';
import { AuthService } from '../../../core/services/auth/auth-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { CampoComponent } from '../../../shared/campo-component/campo-component';

/** Codice ricevuto per email alla registrazione; si può chiederne uno nuovo. */
@Component({
  selector: 'app-verifica-email',
  imports: [ReactiveFormsModule, TranslocoPipe, CampoComponent],
  templateUrl: './verifica-email-component.html',
  styleUrls: ['../profilo-sezioni.css', './verifica-email-component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificaEmailComponent {
  private readonly auth = inject(AuthService);
  private readonly avvisi = inject(AvvisiService);
  private readonly transloco = inject(TranslocoService);
  protected readonly errori = inject(ErroriService);

  protected readonly cifre = CIFRE_CODICE_VERIFICA;
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');
  protected readonly inviato = signal(false);
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    codice: ['', [Validators.required, Validators.pattern(`\\d{${CIFRE_CODICE_VERIFICA}}`)]],
  });

  /**
   * VERIFICA
   * Con il codice giusto la sessione segna l'email come verificata e la sezione sparisce.
   */
  verifica(): void {
    if (this.modulo.invalid) {
      this.modulo.markAllAsTouched();
      return;
    }
    this.avvia();
    this.auth
      .verificaEmail(this.modulo.controls.codice.value)
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: () => this.avvisi.mostra(this.transloco.translate('verifica.fatta'), 'successo'),
        error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
      });
  }

  /**
   * RICHIEDI CODICE
   * Il backend invalida il codice precedente e ne manda uno nuovo.
   */
  richiediCodice(): void {
    this.avvia();
    this.auth
      .richiediCodiceVerifica()
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: () => this.inviato.set(true),
        error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
      });
  }

  private avvia(): void {
    this.inCorso.set(true);
    this.errore.set('');
    this.inviato.set(false);
  }
}
