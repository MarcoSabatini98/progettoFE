import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';

import {
  dataCalendario,
  giorniTra,
  primoDelMese,
  spostaData,
  spostaMese,
} from '../../../core/services/disponibilita/date-soggiorno';
import { DisponibilitaService } from '../../../core/services/disponibilita/disponibilita-service';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { FiltriOccupazione } from '../../../shared/models/occupazione-camera/occupazione-camera-model';
import { DataPipe } from '../../../shared/pipes/data-pipe';

/** Mesi affiancati: sul telefono il secondo si nasconde. */
const MESI_VISIBILI = 2;
/** Un lunedì qualsiasi, da cui ricavare i nomi dei giorni della settimana. */
const UN_LUNEDI = '2024-01-01';

export interface DateSoggiorno {
  arrivo: string;
  partenza: string;
}

interface GiornoCalendario {
  data: string;
  numero: number;
  /** Notte occupata: rossa e cliccabile solo come partenza. */
  occupato: boolean;
  /** Cliccabile come arrivo o come partenza dopo l'arrivo scelto. */
  attivo: boolean;
  inSoggiorno: boolean;
}

interface MeseCalendario {
  inizio: string;
  /** Colonna del primo giorno: la settimana parte dal lunedì. */
  colonna: number;
  giorni: GiornoCalendario[];
}

/**
 * Calendario delle date del soggiorno: primo clic l'arrivo, secondo la partenza.
 * Con una camera o una tipologia colora le notti libere (verdi) e occupate (rosse);
 * senza è neutro. Le notti vanno da [arrivo, partenza): la partenza può cadere
 * sulla prima notte occupata (si lascia la camera la mattina), ma non oltre.
 */
@Component({
  selector: 'app-calendario-soggiorno',
  imports: [TranslocoPipe, IconaComponent, DataPipe],
  templateUrl: './calendario-soggiorno-component.html',
  styleUrl: './calendario-soggiorno-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarioSoggiornoComponent {
  private readonly disponibilita = inject(DisponibilitaService);
  private readonly lingua = inject(LinguaService);

  readonly arrivo = input('');
  readonly partenza = input('');
  /** Camera o tipologia di cui mostrare le notti occupate; senza, calendario neutro. */
  readonly filtri = input<FiltriOccupazione>();
  readonly scelta = output<DateSoggiorno>();

  protected readonly oggi = dataCalendario(new Date());
  protected readonly mese = signal(primoDelMese(this.oggi));
  protected readonly primoMese = computed(() => this.mese() <= primoDelMese(this.oggi));

  private readonly occupazione = rxResource({
    params: () => {
      const filtri = this.filtri();
      return filtri && { filtri, dal: this.mese(), al: spostaMese(this.mese(), MESI_VISIBILI) };
    },
    stream: ({ params }) =>
      this.disponibilita.leggiOccupazione(params.filtri, params.dal, params.al),
  });
  /** Colori solo a occupazione caricata: mentre arriva il calendario resta neutro. */
  protected readonly colorato = computed(() => this.occupazione.hasValue());
  /** Notti occupate in ordine, come arrivano dall'API. */
  private readonly elencoOccupate = computed(() =>
    this.occupazione.hasValue() ? this.occupazione.value() : [],
  );
  private readonly occupate = computed(() => new Set(this.elencoOccupate()));
  /**
   * Scelto l'arrivo, l'ultima partenza possibile: la prima notte occupata dopo.
   * ponytail: vede solo i mesi caricati; oltre, l'eventuale conflitto lo segnala la ricerca.
   */
  private readonly partenzaMassima = computed(() => {
    const arrivo = this.arrivo();
    return arrivo ? this.elencoOccupate().find((notte) => notte > arrivo) : undefined;
  });

  protected readonly settimana = computed(() => {
    const formato = new Intl.DateTimeFormat(this.lingua.attiva(), { weekday: 'short' });
    return Array.from({ length: 7 }, (_, giorno) =>
      formato.format(new Date(`${spostaData(UN_LUNEDI, giorno)}T00:00`)),
    );
  });
  protected readonly mesi = computed(() =>
    Array.from({ length: MESI_VISIBILI }, (_, indice) =>
      this.creaMese(spostaMese(this.mese(), indice)),
    ),
  );
  protected readonly notti = computed(() =>
    this.arrivo() && this.partenza() ? giorniTra(this.arrivo(), this.partenza()) : 0,
  );

  /**
   * SCEGLI
   * Dopo l'arrivo un giorno valido è la partenza; ogni altro giorno libero è un nuovo arrivo.
   */
  scegli(data: string): void {
    this.scelta.emit(
      this.partenzaPossibile(data)
        ? { arrivo: this.arrivo(), partenza: data }
        : { arrivo: data, partenza: '' },
    );
  }

  /** SPOSTA — un mese avanti o indietro, mai prima di quello corrente. */
  sposta(mesi: number): void {
    this.mese.update((mese) => spostaMese(mese, mesi));
  }

  private partenzaPossibile(data: string): boolean {
    const arrivo = this.arrivo();
    const massima = this.partenzaMassima();
    return !!arrivo && !this.partenza() && data > arrivo && (!massima || data <= massima);
  }

  private creaMese(inizio: string): MeseCalendario {
    const [anno, numero] = inizio.split('-').map(Number);
    const lunghezza = new Date(anno, numero, 0).getDate();
    return {
      inizio,
      colonna: ((new Date(anno, numero - 1, 1).getDay() + 6) % 7) + 1,
      giorni: Array.from({ length: lunghezza }, (_, indice) =>
        this.creaGiorno(spostaData(inizio, indice), indice + 1),
      ),
    };
  }

  private creaGiorno(data: string, numero: number): GiornoCalendario {
    const occupato = this.occupate().has(data);
    const partenza = this.partenza();
    return {
      data,
      numero,
      occupato,
      attivo: data >= this.oggi && (!occupato || this.partenzaPossibile(data)),
      inSoggiorno: !!partenza && data > this.arrivo() && data < partenza,
    };
  }
}
