import { OccupazioneGiornoInterface } from '../occupazione-giorno/occupazione-giorno-model';
import { PeriodoInterface } from '../periodo/periodo-model';

/** Occupazione giorno per giorno con il riepilogo del periodo. Importi in euro. */
export interface ReportOccupazioneInterface extends PeriodoInterface {
  riepilogo: {
    notti_disponibili: number;
    notti_vendute: number;
    occupazione_percentuale: number;
    ricavo_camere: number;
    /** Ricavo medio per notte venduta. */
    adr: number;
    /** Ricavo medio per notte disponibile. */
    revpar: number;
  };
  giorni: OccupazioneGiornoInterface[];
}
