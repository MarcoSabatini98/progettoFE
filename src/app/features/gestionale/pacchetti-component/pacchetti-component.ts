import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

import { AuthService } from '../../../core/services/auth/auth-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { Listino } from '../../../core/services/api/listino';
import { PERMESSI } from '../../../core/services/ruoli/ruoli-costanti';
import { LIMITI_TARIFFE } from '../../../core/services/tariffe/tariffe-costanti';
import { TariffeService } from '../../../core/services/tariffe/tariffe-service';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import {
  PacchettoCreaPayload,
  PacchettoInterface,
} from '../../../shared/models/pacchetto/pacchetto-model';
import { ServizioRichiestoPayload } from '../../../shared/models/prenotazione-servizio/prenotazione-servizio-model';
import { TipologiaCameraInterface } from '../../../shared/models/tipologia-camera/tipologia-camera-model';
import { PrezzoPipe } from '../../../shared/pipes/prezzo-pipe';
import { AzioniListinoComponent } from '../azioni-listino-component/azioni-listino-component';
import { GalleriaMediaComponent } from '../galleria-media-component/galleria-media-component';
import { ListinoComponent } from '../listino-component/listino-component';
import { ServiziPacchettoComponent } from '../servizi-pacchetto-component/servizi-pacchetto-component';
import { TraduzioniComponent } from '../traduzioni-component/traduzioni-component';

/** Pacchetti: soggiorno e servizi a prezzo fisso, con le foto mostrate sul sito. */
@Component({
  selector: 'app-pacchetti',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    CampoComponent,
    ListinoComponent,
    AzioniListinoComponent,
    ServiziPacchettoComponent,
    GalleriaMediaComponent,
    PrezzoPipe,
    TraduzioniComponent,
  ],
  templateUrl: './pacchetti-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PacchettiComponent {
  private readonly tariffe = inject(TariffeService);
  private readonly auth = inject(AuthService);
  protected readonly errori = inject(ErroriService);

  readonly tipologie = input.required<TipologiaCameraInterface[]>();

  /** Le foto le gestisce chi gestisce i contenuti: per gli altri il backend le rifiuta. */
  protected readonly gestisceFoto = computed(() =>
    this.auth.haPermessi([PERMESSI.CONTENUTI_GESTISCI]),
  );

  protected readonly limiti = LIMITI_TARIFFE;
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    nome: ['', [Validators.required, Validators.maxLength(LIMITI_TARIFFE.nome)]],
    descrizione: ['', Validators.maxLength(LIMITI_TARIFFE.descrizione)],
    prezzo: [
      null as number | null,
      [Validators.required, Validators.min(0), Validators.max(LIMITI_TARIFFE.importo)],
    ],
    tipologia_id: [null as number | null],
    notti_min: [null as number | null, [Validators.min(1), Validators.max(LIMITI_TARIFFE.piccolo)]],
    valido_dal: [''],
    valido_al: [''],
    attivo: [true],
    ordine: [0, [Validators.min(0), Validators.max(LIMITI_TARIFFE.ordine)]],
    servizi: [[] as ServizioRichiestoPayload[]],
  });
  protected readonly listino = new Listino<PacchettoInterface, PacchettoCreaPayload>(
    {
      elenca: () => this.tariffe.elencaPacchetti(),
      crea: (dati) => this.tariffe.creaPacchetto(dati),
      aggiorna: (id, dati) => this.tariffe.aggiornaPacchetto(id, dati),
      elimina: (id) => this.tariffe.eliminaPacchetto(id),
    },
    this.modulo,
    (pacchetto) => ({
      servizi: (pacchetto.servizi ?? []).map((servizio) => ({
        servizio_id: servizio.id,
        quantita: servizio.PacchettoServizio.quantita,
      })),
    }),
  );

  /** Foto della scelta come le ha l'elenco, che si rilegge dopo ogni cambio. */
  protected readonly media = computed(() => {
    const id = this.listino.scelta()?.id;
    const elenco = this.listino.elenco;
    return (elenco.hasValue() ? elenco.value() : []).find((voce) => voce.id === id)?.media ?? [];
  });
}
