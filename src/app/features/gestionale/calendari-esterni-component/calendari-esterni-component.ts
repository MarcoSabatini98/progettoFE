import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { Listino } from '../../../core/services/api/listino';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import {
  LIMITI_CALENDARI,
  URL_CALENDARIO,
} from '../../../core/services/calendari/calendari-costanti';
import { CalendariService } from '../../../core/services/calendari/calendari-service';
import { CamereService } from '../../../core/services/camere/camere-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { CANALI_OTA } from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import {
  CalendarioEsternoCreaPayload,
  CalendarioEsternoInterface,
  CanaleOta,
} from '../../../shared/models/calendario-esterno/calendario-esterno-model';
import { DataPipe } from '../../../shared/pipes/data-pipe';
import { AzioniListinoComponent } from '../azioni-listino-component/azioni-listino-component';
import { ListinoComponent } from '../listino-component/listino-component';

/**
 * Calendari iCal dei portali da importare: ogni 15 minuti il job blocca le loro date.
 * La camera si sceglie alla creazione; dopo 5 errori di fila chi gestisce i calendari è avvisato.
 */
@Component({
  selector: 'app-calendari-esterni',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    CampoComponent,
    IconaComponent,
    ListinoComponent,
    AzioniListinoComponent,
    DataPipe,
  ],
  templateUrl: './calendari-esterni-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendariEsterniComponent {
  private readonly calendari = inject(CalendariService);
  private readonly camereService = inject(CamereService);
  private readonly avvisi = inject(AvvisiService);
  private readonly transloco = inject(TranslocoService);
  protected readonly errori = inject(ErroriService);

  /** Calendario da aprire (link della notifica). */
  readonly apri = input<number>();

  protected readonly limiti = LIMITI_CALENDARI;
  protected readonly canali = CANALI_OTA;
  protected readonly camere = rxResource({ stream: () => this.camereService.elencaCamere() });
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    camera_id: [null as number | null, Validators.required],
    canale: ['booking_com' as CanaleOta],
    nome: ['', [Validators.required, Validators.maxLength(LIMITI_CALENDARI.nome)]],
    url: [
      '',
      [
        Validators.required,
        Validators.maxLength(LIMITI_CALENDARI.url),
        Validators.pattern(URL_CALENDARIO),
      ],
    ],
    attivo: [true],
  });
  protected readonly listino = new Listino<
    CalendarioEsternoInterface,
    CalendarioEsternoCreaPayload
  >(
    {
      elenca: () => this.calendari.elencaCalendari(),
      crea: (dati) => this.calendari.creaCalendario(dati),
      aggiorna: (id, dati) => this.calendari.aggiornaCalendario(id, dati),
      elimina: (id) => this.calendari.eliminaCalendario(id),
    },
    this.modulo,
  );
  protected readonly sincronizzando = signal(false);
  protected readonly erroreSincronizzazione = signal('');
  /** Ultimo calendario aperto dal link: dopo, la scelta resta all'utente. */
  private aperto?: number;

  constructor() {
    effect(() => {
      const id = this.apri();
      const elenco = this.listino.elenco;
      const voce = elenco.hasValue() ? elenco.value().find((v) => v.id === id) : undefined;
      if (!voce || voce.id === this.aperto) return;
      this.aperto = voce.id;
      untracked(() => this.listino.scegli(voce));
    });
    effect(() => {
      this.listino.scelta();
      this.erroreSincronizzazione.set('');
    });
  }

  /**
   * SINCRONIZZA
   * Legge subito il feed del calendario scelto; l'esito nuovo arriva con l'elenco.
   */
  sincronizza(id: number): void {
    this.sincronizzando.set(true);
    this.erroreSincronizzazione.set('');
    this.calendari
      .sincronizza(id)
      .pipe(
        finalize(() => {
          this.sincronizzando.set(false);
          this.listino.elenco.reload();
        }),
      )
      .subscribe({
        next: (eventi) =>
          this.avvisi.mostra(
            this.transloco.translate('gestionale.calendari.esterni.sincronizzato', { eventi }),
            'successo',
          ),
        error: (errore: unknown) => this.erroreSincronizzazione.set(this.errori.messaggio(errore)),
      });
  }
}
