import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AuthService } from '../../../core/services/auth/auth-service';
import { dataCalendario } from '../../../core/services/disponibilita/date-soggiorno';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import { PrenotazioniService } from '../../../core/services/prenotazioni/prenotazioni-service';
import { PERMESSI } from '../../../core/services/ruoli/ruoli-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { GiornataInterface } from '../../../shared/models/giornata/giornata-model';
import { AzioniPrenotazioneComponent } from '../azioni-prenotazione-component/azioni-prenotazione-component';
import { RigaPrenotazioneComponent } from '../riga-prenotazione-component/riga-prenotazione-component';

/** Sezioni della giornata, nell'ordine in cui la reception le affronta. */
const SEZIONI = [
  'arrivi',
  'partenze',
  'in_casa',
] as const satisfies readonly (keyof GiornataInterface)[];

/**
 * Cruscotto della reception: chi arriva, chi parte e chi è in casa nel giorno scelto,
 * con le azioni rapide (conferma, check-in, check-out) su ogni prenotazione.
 */
@Component({
  selector: 'app-giornata',
  imports: [
    RouterLink,
    TranslocoPipe,
    CampoComponent,
    IconaComponent,
    AzioniPrenotazioneComponent,
    RigaPrenotazioneComponent,
  ],
  templateUrl: './giornata-component.html',
  styleUrl: './giornata-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class GiornataComponent {
  private readonly prenotazioni = inject(PrenotazioniService);
  protected readonly errori = inject(ErroriService);

  protected readonly sezioni = SEZIONI;
  protected readonly nuova = PERCORSI_STAFF.nuovaPrenotazione;
  protected readonly puoPrenotare = inject(AuthService).haPermessi([
    PERMESSI.PRENOTAZIONI_GESTISCI,
  ]);
  protected readonly giorno = signal(dataCalendario(new Date()));
  protected readonly giornata = rxResource({
    params: () => this.giorno(),
    stream: ({ params: giorno }) => this.prenotazioni.leggiGiornata(giorno),
  });

  /**
   * CAMBIA GIORNO
   * Un campo data svuotato torna a oggi.
   */
  cambiaGiorno(valore: string): void {
    this.giorno.set(valore || dataCalendario(new Date()));
  }
}
