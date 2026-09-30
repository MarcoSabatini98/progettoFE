import type { STATI_SEGNALAZIONE } from '../../../core/services/pulizie/pulizie-costanti';
import { Priorita } from '../attivita-pulizia/attivita-pulizia-model';
import { CameraInterface, StatoCamera } from '../camera/camera-model';
import { ParametriPaginaInterface } from '../pagina/pagina-model';
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

/** Chi non gestisce la manutenzione vede solo le proprie segnalazioni. */
export interface FiltriSegnalazioni extends ParametriPaginaInterface {
  stato?: StatoSegnalazione;
  /** aperta o in_corso */
  aperte?: boolean;
  priorita?: Priorita;
  camera_id?: number;
  mie?: boolean;
}

/** stato_camera cambia anche la camera (es. fuori_servizio): solo chi gestisce. */
export type SegnalazioneCreaPayload = Pick<SegnalazioneManutenzioneInterface, 'titolo'> &
  Partial<
    Pick<SegnalazioneManutenzioneInterface, 'camera_id' | 'descrizione' | 'priorita'> & {
      stato_camera: StatoCamera;
    }
  >;

export type SegnalazioneAggiornaPayload = Partial<
  Pick<
    SegnalazioneManutenzioneInterface,
    'stato' | 'assegnata_a' | 'priorita' | 'titolo' | 'descrizione' | 'note_risoluzione'
  > & { stato_camera: StatoCamera }
>;
