import { TipoPulizia } from '../attivita-pulizia/attivita-pulizia-model';

/** Voce della checklist copiata nelle nuove attività di pulizia. tipo_pulizia null = vale per tutti i tipi. */
export interface ChecklistModelloInterface {
  id: number;
  voce: string;
  tipo_pulizia: TipoPulizia | null;
  ordine: number;
  attiva: boolean;
}
