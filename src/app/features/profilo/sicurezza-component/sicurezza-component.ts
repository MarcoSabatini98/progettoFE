import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { Observable, finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth/auth-service';
import { creaNuovaPasswordForm } from '../../../core/services/auth/nuova-password-form';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { PERCORSI_PUBBLICI } from '../../../core/services/navigazione/navigazione-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { NuovaPasswordComponent } from '../../../shared/nuova-password-component/nuova-password-component';

/** Cambio password e chiusura delle sessioni: entrambi chiudono anche quella corrente. */
@Component({
  selector: 'app-sicurezza',
  imports: [ReactiveFormsModule, TranslocoPipe, CampoComponent, NuovaPasswordComponent],
  templateUrl: './sicurezza-component.html',
  styleUrls: ['../profilo-sezioni.css', './sicurezza-component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SicurezzaComponent {
  private readonly auth = inject(AuthService);
  private readonly avvisi = inject(AvvisiService);
  private readonly router = inject(Router);
  private readonly transloco = inject(TranslocoService);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly errori = inject(ErroriService);

  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');
  protected readonly modulo = this.fb.group({
    attuale: ['', Validators.required],
    nuova: creaNuovaPasswordForm(this.fb),
  });

  /**
   * CAMBIA PASSWORD
   * Il backend chiude tutte le sessioni: si rientra con la password nuova.
   */
  cambiaPassword(): void {
    if (this.modulo.invalid) {
      this.modulo.markAllAsTouched();
      return;
    }
    const { attuale, nuova } = this.modulo.getRawValue();
    this.esegui(
      this.auth.cambiaPassword({ password_attuale: attuale, nuova_password: nuova.password }),
      'sicurezza.cambiata',
      PERCORSI_PUBBLICI.accesso,
    );
  }

  /**
   * ESCI OVUNQUE
   * Per un dispositivo perso o una password condivisa per errore.
   */
  esciOvunque(): void {
    this.esegui(this.auth.esciOvunque(), 'sicurezza.uscito', PERCORSI_PUBBLICI.home);
  }

  private esegui(richiesta: Observable<null>, avviso: string, destinazione: string): void {
    this.inCorso.set(true);
    this.errore.set('');
    richiesta.pipe(finalize(() => this.inCorso.set(false))).subscribe({
      next: () => {
        this.avvisi.mostra(this.transloco.translate(avviso), 'successo');
        void this.router.navigateByUrl(destinazione);
      },
      error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
    });
  }
}
