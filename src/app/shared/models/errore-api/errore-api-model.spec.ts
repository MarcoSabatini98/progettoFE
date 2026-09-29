import { describe, expect, it } from 'vitest';

import { RispostaErroreApiInterface } from './errore-api-model';

describe('RispostaErroreApiInterface', () => {
  it('accetta un errore di validazione con i dettagli dei campi', () => {
    const risposta: RispostaErroreApiInterface = {
      successo: false,
      errore: {
        codice: 'DATI_NON_VALIDI',
        messaggio: 'Alcuni dati non sono validi',
        dettagli: [{ campo: 'email', messaggio: 'email non valida' }],
      },
    };

    expect(risposta.errore.codice).toBe('DATI_NON_VALIDI');
    expect(risposta.errore.dettagli?.[0].campo).toBe('email');
  });

  it('accetta un errore senza dettagli', () => {
    const risposta: RispostaErroreApiInterface = {
      successo: false,
      errore: { codice: 'NON_AUTENTICATO', messaggio: 'Accesso richiesto' },
    };

    expect(risposta.errore.dettagli).toBeUndefined();
  });
});
