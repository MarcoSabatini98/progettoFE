import {
  AttivitaPuliziaInterface,
  StatoAttivitaPulizia,
} from '../../../shared/models/attivita-pulizia/attivita-pulizia-model';
import { AuthService } from '../auth/auth-service';
import { PERMESSI } from '../ruoli/ruoli-costanti';
import { TRANSIZIONI_PULIZIA } from './pulizie-costanti';

/** Cosa può fare chi è collegato con le pulizie. */
export interface PermessiPulizia {
  utenteId: number | undefined;
  esegue: boolean;
  gestisce: boolean;
}

/** Permessi di chi è collegato, letti dalla sessione. */
export function permessiPulizia(auth: AuthService): PermessiPulizia {
  return {
    utenteId: auth.utente()?.id,
    esegue: auth.haPermessi([PERMESSI.PULIZIE_ESEGUI]),
    gestisce: auth.haPermessi([PERMESSI.PULIZIE_GESTISCI]),
  };
}

/** L'addetto lavora sulle sue attività o su quelle libere; chi gestisce su tutte. */
export function puoLavorare(
  attivita: AttivitaPuliziaInterface,
  permessi: PermessiPulizia,
): boolean {
  const assegnata = attivita.assegnata_a;
  const mia = !assegnata || assegnata === permessi.utenteId;
  return permessi.esegue && (mia || permessi.gestisce);
}

/** Minuti tra inizio e fine della pulizia; null se non è ancora finita. */
export function minutiPulizia(attivita: AttivitaPuliziaInterface): number | null {
  if (!attivita.iniziata_il || !attivita.completata_il) return null;
  return Math.round(
    (Date.parse(attivita.completata_il) - Date.parse(attivita.iniziata_il)) / 60_000,
  );
}

/** Passaggi di stato ammessi: verifica e ispezione respinta solo a chi gestisce. */
export function passaggiPulizia(
  stato: StatoAttivitaPulizia,
  gestisce: boolean,
): StatoAttivitaPulizia[] {
  return Object.entries(TRANSIZIONI_PULIZIA[stato])
    .filter(([, soloGestore]) => !soloGestore || gestisce)
    .map(([verso]) => verso as StatoAttivitaPulizia);
}
