/** Contatori per i badge della chat, solo conversazioni aperte. */
export interface NonLettiChatInterface {
  staff: number;
  /** Staff: solo le assistenze assegnate a sé. */
  assistenza: number;
  /** Assistenze ancora da prendere: 0 per chi non gestisce l'assistenza. */
  libere: number;
}
