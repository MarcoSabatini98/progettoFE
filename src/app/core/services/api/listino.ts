import { effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { TranslocoService } from '@jsverse/transloco';
import { Observable, finalize } from 'rxjs';

import { campiCambiati, valoriModulo } from './campi-cambiati';
import { AvvisiService } from '../avvisi/avvisi-service';
import { ErroriService } from '../errori/errori-service';

/**
 * Chiamate di un listino: elenco di voci da creare, modificare ed eliminare (piani, calendari...).
 * Scritte come metodi così un Listino<Piano, PianoCrea> vale anche come Listino<Piano, unknown>.
 */
export interface RichiesteListino<T, C> {
  elenca(): Observable<T[]>;
  crea(dati: C): Observable<T>;
  aggiorna(id: number, dati: Partial<C>): Observable<T>;
  elimina(id: number): Observable<null>;
}

/** Valori del modulo che non si copiano tali e quali dalla voce (es. i servizi di un pacchetto). */
export type AdattaVoce<T> = (voce: T) => Record<string, unknown>;

/**
 * Stato di un listino: elenco, voce scelta (null = nuova) e salvataggio.
 * Il modulo segue la scelta: la voce scelta lo compila, una nuova lo riporta ai valori iniziali.
 * Si crea in un campo del componente, perché usa inject.
 */
export class Listino<T extends { id: number }, C> {
  private readonly avvisi = inject(AvvisiService);
  private readonly transloco = inject(TranslocoService);
  private readonly errori = inject(ErroriService);
  private readonly richieste: RichiesteListino<T, C>;
  private readonly modulo: FormGroup;

  readonly elenco;
  readonly scelta = signal<T | null>(null);
  readonly inCorso = signal(false);
  readonly errore = signal('');
  /** Per la scheda "Elimina": toglie la voce scelta. */
  readonly elimina = () => this.richieste.elimina(this.scelta()!.id);

  constructor(
    richieste: RichiesteListino<T, C>,
    modulo: FormGroup,
    adatta: AdattaVoce<T> = () => ({}),
  ) {
    this.richieste = richieste;
    this.modulo = modulo;
    this.elenco = rxResource({ stream: () => richieste.elenca() });
    effect(() => {
      const voce = this.scelta();
      modulo.reset(voce ? { ...valoriVoce(modulo.controls, voce), ...adatta(voce) } : undefined);
    });
  }

  /**
   * SCEGLI
   * null = si compila una voce nuova.
   */
  scegli(voce: T | null): void {
    this.errore.set('');
    this.scelta.set(voce);
  }

  /**
   * SALVA
   * Nuova: tutti i campi. Scelta: i soli cambiati, niente se non è cambiato nulla.
   * Salvata resta scelta, con i dati del backend.
   */
  salva(): void {
    const modulo = this.modulo;
    if (modulo.invalid) {
      modulo.markAllAsTouched();
      return;
    }
    const scelta = this.scelta();
    const modifiche = campiCambiati(modulo.controls) as Partial<C>;
    if (scelta && !Object.keys(modifiche).length) return;
    const richiesta = scelta
      ? this.richieste.aggiorna(scelta.id, modifiche)
      : this.richieste.crea(valoriModulo(modulo.controls) as C);
    this.inCorso.set(true);
    this.errore.set('');
    richiesta.pipe(finalize(() => this.inCorso.set(false))).subscribe({
      next: (voce) => {
        this.avvisi.mostra(this.transloco.translate('gestionale.listino.salvata'), 'successo');
        this.scegli(voce);
        this.elenco.reload();
      },
      error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
    });
  }

  /**
   * RICARICA
   * Dopo un'eliminazione: si torna a una voce nuova con l'elenco aggiornato.
   */
  ricarica(): void {
    this.scegli(null);
    this.elenco.reload();
  }
}

/**
 * Valori della voce per i campi del modulo.
 * I DECIMAL arrivano come testo: diventano numeri dove il campo non parte da un testo.
 */
function valoriVoce(
  controlli: Record<string, AbstractControl>,
  voce: object,
): Record<string, unknown> {
  const valori = voce as Record<string, unknown>;
  return Object.fromEntries(
    Object.entries(controlli).map(([campo, controllo]) => {
      const valore = valori[campo];
      const testo = typeof (controllo as FormControl).defaultValue === 'string';
      return [campo, typeof valore === 'string' && !testo ? Number(valore) : valore];
    }),
  );
}
