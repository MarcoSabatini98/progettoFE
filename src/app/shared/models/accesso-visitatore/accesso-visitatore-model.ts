import { VisitatoreInterface } from '../visitatore/visitatore-model';

/** Visitatore senza account appena registrato: il token apre la chat di assistenza. */
export interface AccessoVisitatoreInterface {
  token: string;
  visitatore: Pick<VisitatoreInterface, 'uuid' | 'nome'>;
}
