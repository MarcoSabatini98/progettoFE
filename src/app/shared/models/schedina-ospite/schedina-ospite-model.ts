import { InvioAlloggiatiInterface } from '../invio-alloggiati/invio-alloggiati-model';
import { OspiteInterface } from '../ospite/ospite-model';
import { PrenotazioneOspiteInterface } from '../prenotazione-ospite/prenotazione-ospite-model';

/** Un ospite pronto (o no) per Alloggiati Web. */
export interface SchedinaOspiteInterface
  extends
    Pick<OspiteInterface, 'nome' | 'cognome'>,
    Pick<PrenotazioneOspiteInterface, 'tipo_alloggiato'> {
  ospite_id: number;
  /** Nomi dei campi da completare prima dell'invio. */
  campi_mancanti: string[];
  /** Riga del tracciato; null finché mancano dati. */
  schedina: string | null;
  ultimo_invio: InvioAlloggiatiInterface | null;
}
