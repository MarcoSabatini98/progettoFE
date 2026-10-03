import { describe, expect, it } from 'vitest';

import { ConversazioneInterface } from '../../../shared/models/conversazione/conversazione-model';
import { nomeConversazione } from './nome-conversazione';

describe('nomeConversazione', () => {
  const conversazione = (dati: object) => ({ titolo: null, ...dati }) as ConversazioneInterface;

  it('usa il titolo dei gruppi', () => {
    expect(nomeConversazione(conversazione({ tipo: 'staff', titolo: 'Turno' }), 1)).toBe('Turno');
  });

  it("nella chat diretta mostra l'altro partecipante", () => {
    const diretta = conversazione({
      tipo: 'staff',
      partecipanti: [
        { id: 1, nome: 'Marco', cognome: 'Rossi' },
        { id: 2, nome: 'Anna', cognome: 'Bianchi' },
      ],
    });

    expect(nomeConversazione(diretta, 1)).toBe('Anna Bianchi');
  });

  it('per l assistenza mostra il cliente o il visitatore', () => {
    const cliente = conversazione({
      tipo: 'assistenza',
      cliente: { nome: 'Luca', cognome: 'Verdi' },
    });
    const visitatore = conversazione({ tipo: 'assistenza', visitatore: { nome: 'Sara' } });
    const anonimo = conversazione({ tipo: 'assistenza', visitatore: { nome: null } });

    expect(nomeConversazione(cliente)).toBe('Luca Verdi');
    expect(nomeConversazione(visitatore)).toBe('Sara');
    expect(nomeConversazione(anonimo)).toBe('');
  });
});
