import type { TIPI_ALLOGGIATO } from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { OspiteCreaPayload, OspiteInterface, SchedaOspiteInterface } from '../ospite/ospite-model';

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
export type OspiteSoggiornoInterface = SchedaOspiteInterface &
  Pick<PrenotazioneOspiteInterface, 'tipo_alloggiato' | 'esente_tassa' | 'motivo_esenzione'>;

/** Riga della lista ospiti: lo staff può agganciare un'anagrafica esistente col solo id. */
export interface RigaOspitePayload<O = OspiteCreaPayload | Pick<OspiteInterface, 'id'>> {
  ospite: O;
  tipo_alloggiato?: TipoAlloggiato;
  esente_tassa?: boolean;
  motivo_esenzione?: string | null;
}

/** Ospite nella lista che lo staff compone: chi è appena aggiunto non ha ancora un'anagrafica. */
export type OspiteInListaInterface = Pick<OspiteInterface, 'nome' | 'cognome'> &
  Partial<Pick<OspiteSoggiornoInterface, 'id' | 'campi_mancanti'>>;

/** Riga della lista ospiti in modifica, prima di salvarla. */
export type RigaOspiteInListaInterface = Required<RigaOspitePayload<OspiteInListaInterface>>;
