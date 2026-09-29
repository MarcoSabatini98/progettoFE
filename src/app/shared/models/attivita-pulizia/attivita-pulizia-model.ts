import type {
  PRIORITA,
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
