import { CodicePermesso, PermessoInterface } from '../permesso/permesso-model';
import { RuoloInterface } from '../ruolo/ruolo-model';

/** Ruolo coi codici dei permessi assegnati (l'admin li ha sempre tutti). */
export type RuoloConPermessiInterface = Omit<RuoloInterface, 'permessi'> & {
  permessi: CodicePermesso[];
};

/** Catalogo dei permessi e assegnazioni per ruolo: la griglia dell'admin. */
export interface MatricePermessiInterface {
  permessi: PermessoInterface[];
  ruoli: RuoloConPermessiInterface[];
}
