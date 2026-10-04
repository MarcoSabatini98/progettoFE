import type {
  PRIORITA,
  RINVII_PULIZIA,
  STATI_ATTIVITA_PULIZIA,
  TIPI_PULIZIA,
} from '../../../core/services/pulizie/pulizie-costanti';
import { CameraInterface } from '../camera/camera-model';
import { PrenotazioneInterface } from '../prenotazione/prenotazione-model';
import { UtenteInterface } from '../utente/utente-model';

export type TipoPulizia = (typeof TIPI_PULIZIA)[number];
export type Priorita = (typeof PRIORITA)[number];
export type StatoAttivitaPulizia = (typeof STATI_ATTIVITA_PULIZIA)[number];

/** Voce della checklist dentro un'attività. */
export interface VoceChecklistInterface {
  voce: string;
  fatto: boolean;
}

/** Pulizia di una camera in una giornata, assegnata a un addetto e verificata dal responsabile. */
export interface AttivitaPuliziaInterface {
  id: number;
  camera_id: number;
  prenotazione_id: number | null;
  assegnata_a: number | null;
  /** 'YYYY-MM-DD' */
  data_prevista: string;
  tipo: TipoPulizia;
  priorita: Priorita;
  stato: StatoAttivitaPulizia;
  checklist: VoceChecklistInterface[] | null;
  note: string | null;
  iniziata_il: string | null;
  completata_il: string | null;
  /** "Non disturbare": in fondo alla coda del giorno da questo momento. */
  rinviata_il: string | null;
  verificata_il: string | null;
  verificata_da: number | null;
  creato_da: number | null;
  creato_il: string;
  aggiornato_il: string;

  // ─── Associazioni ───
  camera?: CameraInterface;
  prenotazione?: PrenotazioneInterface | null;
  addetto?: UtenteInterface | null;
  verificatore?: UtenteInterface | null;
}

/** Attività di una giornata. */
export interface FiltriPulizie {
  /** 'YYYY-MM-DD', vuota = oggi. */
  data?: string;
  stato?: StatoAttivitaPulizia;
  camera_id?: number;
  assegnata_a?: number;
  /** Solo le attività assegnate a me. */
  mie?: boolean;
}

export type AttivitaPuliziaCreaPayload = Pick<
  AttivitaPuliziaInterface,
  'camera_id' | 'data_prevista' | 'tipo'
> &
  Partial<Pick<AttivitaPuliziaInterface, 'prenotazione_id' | 'assegnata_a' | 'priorita' | 'note'>>;

export type AttivitaPuliziaAggiornaPayload = Partial<
  Pick<AttivitaPuliziaInterface, 'assegnata_a' | 'data_prevista' | 'priorita' | 'tipo' | 'note'>
>;

/** "Non disturbare": più tardi in giornata o domani. */
export type RinvioPulizia = (typeof RINVII_PULIZIA)[number];

/** Lavoro dell'addetto. Il BE controlla che il passaggio di stato sia ammesso. */
export type AvanzamentoPuliziaPayload = Partial<
  Pick<AttivitaPuliziaInterface, 'stato' | 'note'>
> & {
  checklist?: VoceChecklistInterface[];
};
