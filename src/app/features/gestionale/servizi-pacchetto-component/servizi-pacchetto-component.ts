import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { startWith, switchMap } from 'rxjs';

import { CamereService } from '../../../core/services/camere/camere-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { LIMITI_TARIFFE } from '../../../core/services/tariffe/tariffe-costanti';
import { ServizioRichiestoPayload } from '../../../shared/models/prenotazione-servizio/prenotazione-servizio-model';
import { PrezzoPipe } from '../../../shared/pipes/prezzo-pipe';

/** Servizi extra inclusi nel pacchetto, ognuno con la sua quantità. */
@Component({
  selector: 'app-servizi-pacchetto',
  imports: [TranslocoPipe, PrezzoPipe],
  templateUrl: './servizi-pacchetto-component.html',
  styleUrl: './servizi-pacchetto-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiziPacchettoComponent {
  protected readonly errori = inject(ErroriService);
  private readonly camere = inject(CamereService);

  readonly controllo = input.required<FormControl<ServizioRichiestoPayload[]>>();

  protected readonly massimo = LIMITI_TARIFFE.piccolo;
  protected readonly extra = rxResource({
    stream: () => this.camere.elencaServizi({ tipo: 'extra', attivo: true }),
  });
  private readonly scelte = toSignal(
    toObservable(this.controllo).pipe(
      switchMap((controllo) => controllo.valueChanges.pipe(startWith(controllo.value))),
    ),
    { initialValue: [] },
  );

  /** Quantità inclusa, undefined se il servizio non è nel pacchetto. */
  quantita(id: number): number | undefined {
    return this.scelte().find((scelta) => scelta.servizio_id === id)?.quantita;
  }

  /**
   * SCEGLI
   * Un servizio aggiunto parte da 1.
   */
  scegli(id: number, incluso: boolean): void {
    const altri = this.controllo().value.filter((scelta) => scelta.servizio_id !== id);
    this.imposta(incluso ? [...altri, { servizio_id: id, quantita: 1 }] : altri);
  }

  /**
   * CAMBIA QUANTITÀ
   * Fuori dai limiti torna dentro: da 1 al massimo del backend.
   */
  cambiaQuantita(id: number, valore: number): void {
    const quantita = Math.min(Math.max(Math.trunc(valore) || 1, 1), this.massimo);
    this.imposta(
      this.controllo().value.map((scelta) =>
        scelta.servizio_id === id ? { ...scelta, quantita } : scelta,
      ),
    );
  }

  private imposta(scelte: ServizioRichiestoPayload[]): void {
    const controllo = this.controllo();
    controllo.setValue(scelte);
    controllo.markAsDirty();
  }
}
