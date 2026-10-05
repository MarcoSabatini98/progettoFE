import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { campiCambiati } from '../../../core/services/api/campi-cambiati';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import {
  LINGUA_PREDEFINITA,
  LINGUE,
  NOMI_LINGUE,
} from '../../../core/services/lingua/lingua-costanti';
import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import { RUOLI, RUOLI_ASSEGNABILI, RUOLI_STAFF } from '../../../core/services/ruoli/ruoli-costanti';
import { LUNGHEZZA_DATI_PERSONALI } from '../../../core/services/utenti/utenti-costanti';
import { UtentiService } from '../../../core/services/utenti/utenti-service';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { Lingua } from '../../../shared/models/lingua/lingua-model';
import { CodiceRuolo } from '../../../shared/models/ruolo/ruolo-model';
import { UtenteAggiornaPayload, UtenteInterface } from '../../../shared/models/utente/utente-model';

/**
 * Dati di un account: nome, contatti e ruolo dello staff, stato per tutti.
 * Di un cliente si cambia solo lo stato: i suoi dati stanno nella scheda ospite.
 * Salva i soli campi cambiati; ruolo nuovo o disattivazione chiudono le sue sessioni.
 */
@Component({
  selector: 'app-dati-utente',
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe, CampoComponent],
  templateUrl: './dati-utente-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class DatiUtenteComponent {
  private readonly utenti = inject(UtentiService);
  private readonly avvisi = inject(AvvisiService);
  private readonly transloco = inject(TranslocoService);
  protected readonly errori = inject(ErroriService);

  readonly utente = input.required<UtenteInterface>();
  readonly salvato = output<UtenteInterface>();

  protected readonly ospiti = PERCORSI_STAFF.ospiti;
  protected readonly lingue = LINGUE;
  protected readonly nomiLingue = NOMI_LINGUE;
  protected readonly lunghezza = LUNGHEZZA_DATI_PERSONALI;
  protected readonly cliente = computed(() => this.utente().ruolo === RUOLI.CLIENTE);
  /** L'admin non si assegna: compare solo per chi lo è già, per poterlo declassare. */
  protected readonly ruoli = computed(() =>
    this.utente().ruolo === RUOLI.ADMIN ? RUOLI_STAFF : RUOLI_ASSEGNABILI,
  );
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    nome: ['', [Validators.required, Validators.maxLength(LUNGHEZZA_DATI_PERSONALI.nome)]],
    cognome: ['', [Validators.required, Validators.maxLength(LUNGHEZZA_DATI_PERSONALI.cognome)]],
    telefono: ['', Validators.maxLength(LUNGHEZZA_DATI_PERSONALI.telefono)],
    lingua: [LINGUA_PREDEFINITA as Lingua],
    ruolo: [RUOLI.RECEPTIONIST as CodiceRuolo],
    attivo: [true],
  });

  constructor() {
    effect(() => this.compila(this.utente()));
  }

  /**
   * SALVA
   */
  salva(): void {
    if (this.modulo.invalid) {
      this.modulo.markAllAsTouched();
      return;
    }
    const modifiche = campiCambiati(this.modulo.controls) as UtenteAggiornaPayload;
    if (!Object.keys(modifiche).length) return;
    this.inCorso.set(true);
    this.errore.set('');
    this.utenti
      .aggiornaUtente(this.utente().id, modifiche)
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: (utente) => {
          this.avvisi.mostra(this.transloco.translate('gestionale.utenti.salvato'), 'successo');
          this.salvato.emit(utente);
        },
        error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
      });
  }

  private compila(utente: UtenteInterface): void {
    this.modulo.reset({
      nome: utente.nome,
      cognome: utente.cognome,
      telefono: utente.telefono ?? '',
      lingua: utente.lingua,
      ruolo: utente.ruolo,
      attivo: utente.attivo,
    });
  }
}
