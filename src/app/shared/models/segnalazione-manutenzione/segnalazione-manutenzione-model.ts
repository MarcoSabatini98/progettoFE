import type { STATI_SEGNALAZIONE } from '../../../core/services/pulizie/pulizie-costanti';
import { Priorita } from '../attivita-pulizia/attivita-pulizia-model';
import { CameraInterface } from '../camera/camera-model';
import { UtenteInterface } from '../utente/utente-model';

export type StatoSegnalazione = (typeof STATI_SEGNALAZIONE)[number];

/** Guasto da riparare. camera_id null = area comune. */
export interface SegnalazioneManutenzioneInterface {
  id: number;
  camera_id: number | null;
  titolo: string;
  descrizione: string | null;
  priorita: Priorita;
  stato: StatoSegnalazione;
  segnalata_da: number | null;
  assegnata_a: number | null;
  risolta_il: string | null;
  note_risoluzione: string | null;
  creato_il: string;
  aggiornato_il: string;

  // ─── Associazioni ───
  camera?: CameraInterface | null;
  segnalatore?: UtenteInterface | null;
  incaricato?: UtenteInterface | null;
}
