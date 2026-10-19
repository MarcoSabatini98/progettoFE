import { Lingua } from '../lingua/lingua-model';

/** Chi usa la chat di assistenza senza account. */
export interface VisitatoreInterface {
  id: number;
  uuid: string;
  nome: string | null;
  email: string | null;
  lingua: Lingua;
  utente_id: number | null;
  bloccato: boolean;
  ultimo_accesso_il: string | null;
  creato_il: string;
}

export type VisitatoreCreaPayload = Partial<Pick<VisitatoreInterface, 'nome' | 'email' | 'lingua'>>;
