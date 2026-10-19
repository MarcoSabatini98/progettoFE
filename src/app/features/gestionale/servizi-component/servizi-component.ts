import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

import { Listino } from '../../../core/services/api/listino';
import { AuthService } from '../../../core/services/auth/auth-service';
import {
  CALCOLO_PREZZO,
  ICONA_SERVIZIO_PREDEFINITA,
  LIMITI_SERVIZIO,
  LUNGHEZZA_SERVIZIO,
  TIPI_SERVIZIO,
} from '../../../core/services/camere/camere-costanti';
import { CamereService } from '../../../core/services/camere/camere-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { PERMESSI } from '../../../core/services/ruoli/ruoli-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import {
  CalcoloPrezzo,
  ServizioCreaPayload,
  ServizioInterface,
  TipoServizio,
} from '../../../shared/models/servizio/servizio-model';
import { PrezzoPipe } from '../../../shared/pipes/prezzo-pipe';
import { AzioniListinoComponent } from '../azioni-listino-component/azioni-listino-component';
import { GalleriaMediaComponent } from '../galleria-media-component/galleria-media-component';
import { ListinoComponent } from '../listino-component/listino-component';
import { TraduzioniComponent } from '../traduzioni-component/traduzioni-component';

/**
 * Catalogo dei servizi: dotazioni delle camere (wifi, aria condizionata) ed extra
 * acquistabili con la prenotazione (colazione, transfer), con foto e traduzioni per il sito.
 */
@Component({
  selector: 'app-servizi',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    CampoComponent,
    IconaComponent,
    ListinoComponent,
    AzioniListinoComponent,
    GalleriaMediaComponent,
    TraduzioniComponent,
    PrezzoPipe,
  ],
  templateUrl: './servizi-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class ServiziComponent {
  private readonly camere = inject(CamereService);
  private readonly auth = inject(AuthService);
  protected readonly errori = inject(ErroriService);

  protected readonly tipi = TIPI_SERVIZIO;
  protected readonly calcoli = CALCOLO_PREZZO;
  protected readonly lunghezze = LUNGHEZZA_SERVIZIO;
  protected readonly limiti = LIMITI_SERVIZIO;
  protected readonly iconaPredefinita = ICONA_SERVIZIO_PREDEFINITA;
  /** Dotazioni ed extra in due griglie separate. */
  protected readonly gruppoServizio = (servizio: ServizioInterface) =>
    `gestionale.servizi.gruppi.${servizio.tipo}`;
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    nome: ['', [Validators.required, Validators.maxLength(LUNGHEZZA_SERVIZIO.nome)]],
    tipo: ['dotazione' as TipoServizio, Validators.required],
    descrizione: ['', Validators.maxLength(LUNGHEZZA_SERVIZIO.descrizione)],
    icona: ['', Validators.maxLength(LUNGHEZZA_SERVIZIO.icona)],
    prezzo: [0, [Validators.min(0), Validators.max(LIMITI_SERVIZIO.prezzo)]],
    calcolo_prezzo: ['a_soggiorno' as CalcoloPrezzo],
    // vuota = aliquota predefinita delle impostazioni
    aliquota_iva: [
      null as number | null,
      [Validators.min(0), Validators.max(LIMITI_SERVIZIO.aliquota)],
    ],
    ordine: [0, [Validators.min(0), Validators.max(LIMITI_SERVIZIO.ordine)]],
    attivo: [true],
  });
  protected readonly listino = new Listino<ServizioInterface, ServizioCreaPayload>(
    {
      elenca: () => this.camere.elencaServizi(),
      crea: (dati) => this.camere.creaServizio(dati),
      aggiorna: (id, dati) => this.camere.aggiornaServizio(id, dati),
      elimina: (id) => this.camere.eliminaServizio(id),
    },
    this.modulo,
  );

  /** Le foto le gestisce chi gestisce i contenuti: per gli altri il backend le rifiuta. */
  protected readonly gestisceFoto = computed(() =>
    this.auth.haPermessi([PERMESSI.CONTENUTI_GESTISCI]),
  );
  /** L'elenco non porta le foto: si leggono dalla scheda del servizio scelto. */
  protected readonly dettaglio = rxResource({
    params: () => (this.gestisceFoto() ? this.listino.scelta()?.id : undefined),
    stream: ({ params: id }) => this.camere.leggiServizio(id),
  });
  protected readonly media = computed(() =>
    this.dettaglio.hasValue() ? (this.dettaglio.value().media ?? []) : [],
  );
}
