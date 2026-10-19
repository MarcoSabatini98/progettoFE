import { OccupazioneGiornoInterface } from '../../../shared/models/occupazione-giorno/occupazione-giorno-model';
import { PeriodoInterface } from '../../../shared/models/periodo/periodo-model';
import { dataCalendario } from '../disponibilita/date-soggiorno';

type Unita = 'settimana' | 'mese' | 'anno';

/** Periodi del cruscotto: unità di calendario e quante unità indietro rispetto a oggi. */
const PERIODI = {
  settimana: { unita: 'settimana', scarto: 0 },
  settimanaScorsa: { unita: 'settimana', scarto: -1 },
  mese: { unita: 'mese', scarto: 0 },
  meseScorso: { unita: 'mese', scarto: -1 },
  anno: { unita: 'anno', scarto: 0 },
} as const satisfies Record<string, { unita: Unita; scarto: number }>;

export type PeriodoAndamento = keyof typeof PERIODI;
export const PERIODI_ANDAMENTO = Object.keys(PERIODI) as PeriodoAndamento[];

/** Giorni o mesi del grafico; inizio è 'AAAA-MM-GG' (il primo del mese se per mese). */
export interface VoceAndamento {
  inizio: string;
  occupazione: number;
  ricavo: number;
}

/** Primo giorno dell'unità che contiene oggi, spostata di scarto unità. Settimane da lunedì. */
function inizioUnita(unita: Unita, oggi: Date, scarto: number): Date {
  if (unita === 'anno') {
    return new Date(oggi.getFullYear() + scarto, 0, 1);
  }
  if (unita === 'mese') {
    return new Date(oggi.getFullYear(), oggi.getMonth() + scarto, 1);
  }
  const giorniDaLunedi = (oggi.getDay() + 6) % 7;
  return new Date(
    oggi.getFullYear(),
    oggi.getMonth(),
    oggi.getDate() - giorniDaLunedi + 7 * scarto,
  );
}

function intervalloUnita(unita: Unita, oggi: Date, scarto: number): PeriodoInterface {
  return {
    dal: dataCalendario(inizioUnita(unita, oggi, scarto)),
    al: dataCalendario(inizioUnita(unita, oggi, scarto + 1)),
  };
}

/** Date del periodo, al escluso come vuole l'API. */
export function intervallo(periodo: PeriodoAndamento, oggi = new Date()): PeriodoInterface {
  const { unita, scarto } = PERIODI[periodo];
  return intervalloUnita(unita, oggi, scarto);
}

/** Lo stesso periodo un'unità prima, per il confronto: mese scorso → due mesi fa. */
export function intervalloPrecedente(
  periodo: PeriodoAndamento,
  oggi = new Date(),
): PeriodoInterface {
  const { unita, scarto } = PERIODI[periodo];
  return intervalloUnita(unita, oggi, scarto - 1);
}

/** Nell'anno un punto per mese, negli altri periodi uno per giorno. */
export function perMese(periodo: PeriodoAndamento): boolean {
  return PERIODI[periodo].unita === 'anno';
}

function percentuale(parte: number, totale: number): number {
  return totale > 0 ? Math.round((parte * 1000) / totale) / 10 : 0;
}

/** Occupazione e ricavo per giorno, o per mese sommando le notti di tutti i giorni. */
export function raggruppa(
  giorni: readonly OccupazioneGiornoInterface[],
  mensile: boolean,
): VoceAndamento[] {
  const gruppi = new Map<string, { occupate: number; disponibili: number; ricavo: number }>();
  for (const giorno of giorni) {
    const inizio = mensile ? `${giorno.giorno.slice(0, 7)}-01` : giorno.giorno;
    const gruppo = gruppi.get(inizio) ?? { occupate: 0, disponibili: 0, ricavo: 0 };
    gruppo.occupate += giorno.camere_occupate;
    gruppo.disponibili += giorno.camere_disponibili;
    gruppo.ricavo += giorno.ricavo_camere;
    gruppi.set(inizio, gruppo);
  }
  return [...gruppi].map(([inizio, gruppo]) => ({
    inizio,
    occupazione: percentuale(gruppo.occupate, gruppo.disponibili),
    ricavo: Math.round(gruppo.ricavo * 100) / 100,
  }));
}

/** Occupazione media per giorno della settimana, da lunedì a domenica. */
export function mediaPerGiornoSettimana(giorni: readonly OccupazioneGiornoInterface[]): number[] {
  const somme = Array.from({ length: 7 }, () => ({ occupate: 0, disponibili: 0 }));
  for (const giorno of giorni) {
    const indice = (new Date(`${giorno.giorno}T00:00`).getDay() + 6) % 7;
    somme[indice].occupate += giorno.camere_occupate;
    somme[indice].disponibili += giorno.camere_disponibili;
  }
  return somme.map((somma) => percentuale(somma.occupate, somma.disponibili));
}

/** Variazione rispetto al periodo precedente come frazione (0.12 = +12%); null senza confronto. */
export function variazione(attuale: number, precedente: number): number | null {
  return precedente > 0 ? (attuale - precedente) / precedente : null;
}
