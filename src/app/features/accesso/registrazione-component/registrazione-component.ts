import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth/auth-service';
import { creaNuovaPasswordForm } from '../../../core/services/auth/nuova-password-form';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { PERCORSI_PUBBLICI } from '../../../core/services/navigazione/navigazione-costanti';
import { LUNGHEZZA_DATI_PERSONALI } from '../../../core/services/utenti/utenti-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { RegistrazionePayload } from '../../../shared/models/sessione/sessione-model';
import { NuovaPasswordComponent } from '../../../shared/nuova-password-component/nuova-password-component';

/** Consensi da accettare per registrarsi: ognuno ha la sua pagina in /documenti. */
const CONSENSI_OBBLIGATORI = ['privacy', 'termini'] as const;

/** Nuovo account cliente: dopo la registrazione si entra già collegati nell'area personale. */
@Component({
  selector: 'app-registrazione',
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe, CampoComponent, NuovaPasswordComponent],
  templateUrl: './registrazione-component.html',
  styleUrls: ['../accesso-pagine.css', './registrazione-component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrazioneComponent {
  private readonly auth = inject(AuthService);
  private readonly lingua = inject(LinguaService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly errori = inject(ErroriService);

  protected readonly percorsi = PERCORSI_PUBBLICI;
  protected readonly lunghezza = LUNGHEZZA_DATI_PERSONALI;
  protected readonly consensi = CONSENSI_OBBLIGATORI;
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');
  protected readonly modulo = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(LUNGHEZZA_DATI_PERSONALI.nome)]],
    cognome: ['', [Validators.required, Validators.maxLength(LUNGHEZZA_DATI_PERSONALI.cognome)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', Validators.maxLength(LUNGHEZZA_DATI_PERSONALI.telefono)],
    password: creaNuovaPasswordForm(this.fb),
    privacy: [false, Validators.requiredTrue],
    termini: [false, Validators.requiredTrue],
    marketing: [false],
  });

  /**
   * INVIA
   * Crea l'account nella lingua del sito e apre l'area personale, dove si verifica l'email.
   */
  invia(): void {
    if (this.modulo.invalid) {
      this.modulo.markAllAsTouched();
      return;
    }
    this.inCorso.set(true);
    this.errore.set('');
    this.auth
      .registra(this.payload())
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: () => void this.router.navigateByUrl(PERCORSI_PUBBLICI.areaPersonale),
        error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
      });
  }

  private payload(): RegistrazionePayload {
    const { nome, cognome, email, telefono, password, marketing } = this.modulo.getRawValue();
    return {
      nome,
      cognome,
      email,
      telefono,
      password: password.password,
      lingua: this.lingua.attiva(),
      consensi: { privacy: true, termini: true, marketing },
    };
  }
}
