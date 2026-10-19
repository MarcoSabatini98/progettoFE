import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { AlloggiatiService } from '../../../core/services/alloggiati/alloggiati-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import {
  ESITI_ALLOGGIATI,
  LUNGHEZZA_MESSAGGIO_INVIO,
} from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { EsitoAlloggiati } from '../../../shared/models/invio-alloggiati/invio-alloggiati-model';
import { DataPipe } from '../../../shared/pipes/data-pipe';

/**
 * Schedine Alloggiati Web di una prenotazione: cosa manca a ogni ospite, ultimo invio
 * e registrazione dell'esito dato dal portale.
 */
@Component({
  selector: 'app-schedine-alloggiati',
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe, CampoComponent, DataPipe],
  templateUrl: './schedine-alloggiati-component.html',
  styleUrl: './schedine-alloggiati-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchedineAlloggiatiComponent {
  private readonly alloggiati = inject(AlloggiatiService);
  private readonly avvisi = inject(AvvisiService);
  private readonly transloco = inject(TranslocoService);
  protected readonly errori = inject(ErroriService);

  readonly prenotazioneId = input.required({ transform: numberAttribute });
  /** Esito registrato: la pagina rilegge i soggiorni da inviare. */
  readonly registrato = output();

  protected readonly esiti = ESITI_ALLOGGIATI;
  protected readonly lunghezzaMessaggio = LUNGHEZZA_MESSAGGIO_INVIO;
  protected readonly anagrafica = PERCORSI_STAFF.ospiti;
  protected readonly scheda = rxResource({
    params: () => this.prenotazioneId(),
    stream: ({ params }) => this.alloggiati.leggiScheda(params),
  });
  protected readonly invio = inject(NonNullableFormBuilder).group({
    esito: ['inviata' as EsitoAlloggiati],
    messaggio: ['', Validators.maxLength(LUNGHEZZA_MESSAGGIO_INVIO)],
  });
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');

  /**
   * REGISTRA
   * Annota l'esito del portale per tutti gli ospiti della prenotazione.
   */
  registra(): void {
    const { esito, messaggio } = this.invio.getRawValue();
    this.inCorso.set(true);
    this.errore.set('');
    this.alloggiati
      .registraInvio(this.prenotazioneId(), { esito, messaggio: messaggio || null })
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: (scheda) => {
          this.scheda.set(scheda);
          this.invio.reset();
          this.avvisi.mostra(
            this.transloco.translate('gestionale.schedine.registrato'),
            'successo',
          );
          this.registrato.emit();
        },
        error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
      });
  }
}
