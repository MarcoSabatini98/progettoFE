import { CodicePermesso } from '../permesso/permesso-model';
import { CodiceRuolo } from '../ruolo/ruolo-model';

/**
 * Chi può aprire una rotta o vedere una voce di menu.
 * ruoli: basta uno; permessi: servono tutti. Vuoto = chiunque sia collegato.
 */
export interface RequisitiAccessoInterface {
  ruoli?: readonly CodiceRuolo[];
  permessi?: readonly CodicePermesso[];
}
