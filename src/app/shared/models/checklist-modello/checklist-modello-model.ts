import { TipoPulizia } from '../attivita-pulizia/attivita-pulizia-model';

/** Voce della checklist copiata nelle nuove attività di pulizia. tipo_pulizia null = vale per tutti i tipi. */
export interface ChecklistModelloInterface {
  id: number;
  voce: string;
  tipo_pulizia: TipoPulizia | null;
  ordine: number;
  attiva: boolean;
}

/** Le nuove voci valgono per un tipo di pulizia preciso. */
export type ChecklistModelloCreaPayload = Pick<ChecklistModelloInterface, 'voce'> &
  Partial<Pick<ChecklistModelloInterface, 'ordine' | 'attiva'>> & {
    tipo_pulizia: TipoPulizia;
  };

export type ChecklistModelloAggiornaPayload = Partial<ChecklistModelloCreaPayload>;
