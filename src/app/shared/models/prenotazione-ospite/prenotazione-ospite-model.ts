import type { TIPI_ALLOGGIATO } from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { OspiteCreaPayload, OspiteInterface } from '../ospite/ospite-model';

export type TipoAlloggiato = (typeof TIPI_ALLOGGIATO)[number];

/** Ospite di un soggiorno, con il ruolo nella schedina e l'eventuale esenzione dalla tassa. */
export interface PrenotazioneOspiteInterface {
  prenotazione_id: number;
  ospite_id: number;
  tipo_alloggiato: TipoAlloggiato;
  esente_tassa: boolean;
  motivo_esenzione: string | null;

  // ─── Associazioni ───
  ospite?: OspiteInterface;
}

/** Ospite nella scheda del soggiorno, con i campi che mancano per la schedina Alloggiati. */
export type OspiteSoggiornoInterface = OspiteInterface &
  Pick<PrenotazioneOspiteInterface, 'tipo_alloggiato' | 'esente_tassa' | 'motivo_esenzione'> & {
    campi_mancanti: (keyof OspiteInterface)[];
  };

/** Riga della lista ospiti: lo staff può agganciare un'anagrafica esistente col solo id. */
export interface RigaOspitePayload<O = OspiteCreaPayload | Pick<OspiteInterface, 'id'>> {
  ospite: O;
  tipo_alloggiato?: TipoAlloggiato;
  esente_tassa?: boolean;
  motivo_esenzione?: string | null;
}
