import {
  BarraPlanningInterface,
  RigaPlanningInterface,
} from '../../../shared/models/barra-planning/barra-planning-model';
import { CameraInterface } from '../../../shared/models/camera/camera-model';
import { DataBloccataInterface } from '../../../shared/models/data-bloccata/data-bloccata-model';
import { PeriodoInterface } from '../../../shared/models/periodo/periodo-model';
import { PrenotazioneInterface } from '../../../shared/models/prenotazione/prenotazione-model';
import { giorniTra, spostaData } from '../disponibilita/date-soggiorno';
import { STATI_ATTIVI } from '../prenotazioni/prenotazioni-costanti';

/** Giorni mostrati dal planning (il backend ne accetta al massimo 92). */
export const DURATE_PLANNING = [7, 14, 30] as const;
export type DurataPlanning = (typeof DURATE_PLANNING)[number];
/** All'apertura il planning mostra un mese. */
export const DURATA_PLANNING_PREDEFINITA: DurataPlanning = 30;

/** Soggiorni che il planning mostra (come il backend): occupano la camera o sono finiti. */
export const STATI_PLANNING = [...STATI_ATTIVI, 'conclusa'] as const;

/** Si trascinano solo i soggiorni non ancora cominciati. */
export const STATI_SPOSTABILI: readonly string[] = ['in_attesa', 'confermata'];

/** Periodo di quanti giorni a partire da dal (al escluso, come vuole l'API). */
export function periodoPlanning(dal: string, giorni: number): PeriodoInterface {
  return { dal, al: spostaData(dal, giorni) };
}

/** Una data per colonna. */
export function giorniPeriodo({ dal, al }: PeriodoInterface): string[] {
  return Array.from({ length: giorniTra(dal, al) }, (_, indice) => spostaData(dal, indice));
}

/** Colonne da inizio a fine (esclusa), tagliate sul periodo. */
function colonne(inizio: string, fine: string, { dal, al }: PeriodoInterface) {
  return {
    da: Math.max(giorniTra(dal, inizio), 0) + 1,
    a: Math.min(giorniTra(dal, fine), giorniTra(dal, al)) + 1,
    prima: inizio < dal,
    dopo: fine > al,
  };
}

export function barreChiusure(
  chiusure: readonly DataBloccataInterface[],
  periodo: PeriodoInterface,
): BarraPlanningInterface[] {
  return chiusure.map((chiusura) => ({
    ...colonne(chiusura.data_inizio, chiusura.data_fine, periodo),
    chiusura,
  }));
}

function barrePrenotazioni(
  prenotazioni: readonly PrenotazioneInterface[],
  periodo: PeriodoInterface,
): BarraPlanningInterface[] {
  return prenotazioni.map((prenotazione) => ({
    ...colonne(prenotazione.data_arrivo, prenotazione.data_partenza, periodo),
    prenotazione,
  }));
}

/** Righe del planning: soggiorni e chiusure di ogni camera. */
export function righePlanning(
  camere: readonly CameraInterface[],
  periodo: PeriodoInterface,
): RigaPlanningInterface[] {
  return camere.map((camera) => ({
    camera,
    barre: [
      ...barrePrenotazioni(camera.prenotazioni ?? [], periodo),
      ...barreChiusure(camera.date_bloccate ?? [], periodo),
    ],
  }));
}

/** Stesse notti, quanti giorni dopo (o prima). */
export function spostaSoggiorno(
  prenotazione: Pick<PrenotazioneInterface, 'data_arrivo' | 'data_partenza'>,
  giorni: number,
): Pick<PrenotazioneInterface, 'data_arrivo' | 'data_partenza'> {
  return {
    data_arrivo: spostaData(prenotazione.data_arrivo, giorni),
    data_partenza: spostaData(prenotazione.data_partenza, giorni),
  };
}
