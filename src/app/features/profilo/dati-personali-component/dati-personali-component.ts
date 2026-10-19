import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { LINGUA_PREDEFINITA, NOMI_LINGUE } from '../../../core/services/lingua/lingua-costanti';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { LUNGHEZZA_DATI_PERSONALI } from '../../../core/services/utenti/utenti-costanti';
import { UtentiService } from '../../../core/services/utenti/utenti-service';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { Lingua } from '../../../shared/models/lingua/lingua-model';
import { UtenteInterface } from '../../../shared/models/utente/utente-model';

/** Nome, cognome, telefono e lingua dell'account. La lingua scelta vale anche per il sito. */
@Component({
  selector: 'app-dati-personali',
  imports: [ReactiveFormsModule, TranslocoPipe, CampoComponent],
  templateUrl: './dati-personali-component.html',
  styleUrl: '../profilo-sezioni.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatiPersonaliComponent {
  private readonly utenti = inject(UtentiService);
  private readonly avvisi = inject(AvvisiService);
  private readonly transloco = inject(TranslocoService);
  protected readonly lingua = inject(LinguaService);
  protected readonly errori = inject(ErroriService);

  readonly profilo = input.required<UtenteInterface>();

  protected readonly nomiLingue = NOMI_LINGUE;
  protected readonly lunghezza = LUNGHEZZA_DATI_PERSONALI;
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    nome: ['', [Validators.required, Validators.maxLength(LUNGHEZZA_DATI_PERSONALI.nome)]],
    cognome: ['', [Validators.required, Validators.maxLength(LUNGHEZZA_DATI_PERSONALI.cognome)]],
    telefono: ['', Validators.maxLength(LUNGHEZZA_DATI_PERSONALI.telefono)],
    lingua: [LINGUA_PREDEFINITA as Lingua],
  });

  constructor() {
    effect(() => {
      const { nome, cognome, telefono, lingua } = this.profilo();
      this.modulo.reset({ nome, cognome, telefono: telefono ?? '', lingua });
    });
  }

  /**
   * SALVA
   * Aggiorna account e sessione, poi porta il sito nella lingua scelta.
   */
  salva(): void {
    if (this.modulo.invalid) {
      this.modulo.markAllAsTouched();
      return;
    }
    this.inCorso.set(true);
    this.errore.set('');
    this.utenti
      .aggiornaProfilo(this.modulo.getRawValue())
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: ({ lingua }) => this.completa(lingua),
        error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
      });
  }

  private completa(lingua: Lingua): void {
    this.lingua.imposta(lingua);
    this.modulo.markAsPristine();
    this.avvisi.mostra(this.transloco.translate('profilo.salvato'), 'successo');
  }
}
