import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { creaNuovaPasswordForm } from '../../../core/services/auth/nuova-password-form';
import { ErroriService } from '../../../core/services/errori/errori-service';
import {
  LINGUA_PREDEFINITA,
  LINGUE,
  NOMI_LINGUE,
} from '../../../core/services/lingua/lingua-costanti';
import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import { RUOLI_ASSEGNABILI } from '../../../core/services/ruoli/ruoli-costanti';
import { LUNGHEZZA_DATI_PERSONALI } from '../../../core/services/utenti/utenti-costanti';
import { UtentiService } from '../../../core/services/utenti/utenti-service';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { Lingua } from '../../../shared/models/lingua/lingua-model';
import { RuoloAssegnabile } from '../../../shared/models/ruolo/ruolo-model';
import { UtenteCreaPayload } from '../../../shared/models/utente/utente-model';
import { NuovaPasswordComponent } from '../../../shared/nuova-password-component/nuova-password-component';

/**
 * Nuovo account dello staff con la password iniziale: è già attivo e verificato,
 * e apre la sua scheda. L'admin nasce dal seed, i clienti si registrano dal sito.
 */
@Component({
  selector: 'app-nuovo-staff',
  imports: [ReactiveFormsModule, TranslocoPipe, CampoComponent, NuovaPasswordComponent],
  templateUrl: './nuovo-staff-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class NuovoStaffComponent {
  private readonly utenti = inject(UtentiService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly errori = inject(ErroriService);

  protected readonly ruoli = RUOLI_ASSEGNABILI;
  protected readonly lingue = LINGUE;
  protected readonly nomiLingue = NOMI_LINGUE;
  protected readonly lunghezza = LUNGHEZZA_DATI_PERSONALI;
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');
  protected readonly modulo = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(LUNGHEZZA_DATI_PERSONALI.nome)]],
    cognome: ['', [Validators.required, Validators.maxLength(LUNGHEZZA_DATI_PERSONALI.cognome)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', Validators.maxLength(LUNGHEZZA_DATI_PERSONALI.telefono)],
    lingua: [LINGUA_PREDEFINITA as Lingua],
    ruolo: [RUOLI_ASSEGNABILI[0] as RuoloAssegnabile],
    password: creaNuovaPasswordForm(this.fb),
  });

  /**
   * CREA
   */
  crea(): void {
    if (this.modulo.invalid) {
      this.modulo.markAllAsTouched();
      return;
    }
    this.inCorso.set(true);
    this.errore.set('');
    this.utenti
      .creaUtente(this.payload())
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: (utente) => void this.router.navigate([PERCORSI_STAFF.utenti, utente.id]),
        error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
      });
  }

  private payload(): UtenteCreaPayload {
    const { password, telefono, ...dati } = this.modulo.getRawValue();
    return { ...dati, telefono: telefono.trim() || null, password: password.password };
  }
}
