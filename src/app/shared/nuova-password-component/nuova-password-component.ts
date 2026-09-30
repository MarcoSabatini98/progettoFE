import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

import { LUNGHEZZA_PASSWORD } from '../../core/services/auth/auth-costanti';
import { NuovaPasswordForm } from '../../core/services/auth/nuova-password-form';
import { ErroriService } from '../../core/services/errori/errori-service';
import { CampoComponent } from '../campo-component/campo-component';

/**
 * Nuova password con conferma, dentro il modulo del genitore:
 *
 *   <app-nuova-password [gruppo]="modulo.controls.nuova" />
 */
@Component({
  selector: 'app-nuova-password',
  imports: [ReactiveFormsModule, TranslocoPipe, CampoComponent],
  templateUrl: './nuova-password-component.html',
  styleUrl: './nuova-password-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NuovaPasswordComponent {
  protected readonly errori = inject(ErroriService);

  readonly gruppo = input.required<NuovaPasswordForm>();

  protected readonly lunghezza = LUNGHEZZA_PASSWORD;

  constructor() {
    // Il genitore segna i campi come toccati all'invio: senza questo gli errori resterebbero nascosti (OnPush).
    const rilevamento = inject(ChangeDetectorRef);
    effect((pulizia) => {
      const iscrizione = this.gruppo().events.subscribe(() => rilevamento.markForCheck());
      pulizia(() => iscrizione.unsubscribe());
    });
  }

  /** Errore del campo conferma o, se valido, la password diversa segnalata dal gruppo. */
  protected erroreConferma(): string {
    const { conferma } = this.gruppo().controls;
    return (
      this.errori.campo(conferma) || (conferma.touched ? this.errori.campo(this.gruppo()) : '')
    );
  }
}
