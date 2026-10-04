import { describe, expect, it } from 'vitest';

import { AttivitaPuliziaInterface } from '../../../shared/models/attivita-pulizia/attivita-pulizia-model';
import { AuthService } from '../auth/auth-service';
import { PERMESSI } from '../ruoli/ruoli-costanti';
import { passaggiPulizia, permessiPulizia, puoLavorare } from './passaggi-pulizia';

describe('passaggi delle pulizie', () => {
  const addetto = { utenteId: 4, esegue: true, gestisce: false };
  const attivita = (assegnata_a: number | null) => ({ assegnata_a }) as AttivitaPuliziaInterface;

  it("l'addetto lavora sulle sue e sulle libere, chi gestisce su tutte", () => {
    expect(puoLavorare(attivita(4), addetto)).toBe(true);
    expect(puoLavorare(attivita(null), addetto)).toBe(true);
    expect(puoLavorare(attivita(7), addetto)).toBe(false);
    expect(puoLavorare(attivita(7), { ...addetto, gestisce: true })).toBe(true);
    expect(puoLavorare(attivita(4), { ...addetto, esegue: false })).toBe(false);
  });

  it('verifica e ispezione respinta solo a chi gestisce', () => {
    expect(passaggiPulizia('in_corso', false)).toEqual(['completata', 'da_fare']);
    expect(passaggiPulizia('completata', false)).toEqual([]);
    expect(passaggiPulizia('completata', true)).toEqual(['verificata', 'in_corso']);
    expect(passaggiPulizia('verificata', true)).toEqual([]);
  });

  it('legge i permessi dalla sessione', () => {
    const auth = {
      utente: () => ({ id: 4 }),
      haPermessi: (permessi: string[]) => permessi[0] === PERMESSI.PULIZIE_ESEGUI,
    } as unknown as AuthService;

    expect(permessiPulizia(auth)).toEqual({ utenteId: 4, esegue: true, gestisce: false });
  });
});
