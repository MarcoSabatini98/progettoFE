import { ConversazioneInterface } from '../../../shared/models/conversazione/conversazione-model';

/**
 * Nome da mostrare: il titolo del gruppo, chi chiede assistenza o l'altro della
 * chat diretta. Vuoto se non c'è (visitatore senza nome): ci pensa la traduzione.
 */
export function nomeConversazione(conversazione: ConversazioneInterface, mioId?: number): string {
  if (conversazione.titolo) {
    return conversazione.titolo;
  }
  const persona =
    conversazione.tipo === 'assistenza'
      ? conversazione.cliente
      : conversazione.partecipanti?.find((partecipante) => partecipante.id !== mioId);
  return persona ? `${persona.nome} ${persona.cognome}` : (conversazione.visitatore?.nome ?? '');
}
