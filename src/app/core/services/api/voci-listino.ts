/** Voci mostrate prima di "Mostra altre"; oltre questo numero compare anche la ricerca. */
export const VOCI_VISIBILI = 8;

/** Campi di fine validità delle voci ('AAAA-MM-GG'): codici e pacchetti, stagioni e promozioni. */
const CAMPI_FINE = ['valido_al', 'data_fine'] as const;

/** Testo senza maiuscole né accenti, per confrontare "Città" con "citta". */
function normalizza(testo: string): string {
  return testo
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/** Disattivata o finita prima di oggi ('AAAA-MM-GG'): di norma resta nascosta. */
export function archiviata(voce: object, oggi: string): boolean {
  const campi = voce as Record<string, unknown>;
  return (
    campi['attivo'] === false ||
    CAMPI_FINE.some((campo) => typeof campi[campo] === 'string' && campi[campo] < oggi)
  );
}

/**
 * La voce ha un testo (nome, codice, titolo...) che contiene quello cercato; niente cercato = sì.
 * ponytail: guarda solo i campi di testo della voce, non quello che disegna la riga
 * (es. il nome della tipologia, che arriva come id); se serve, un input con il testo da cercare.
 */
export function contiene(voce: object, cercato: string): boolean {
  const testo = normalizza(cercato.trim());
  return (
    !testo ||
    Object.values(voce).some(
      (valore) => typeof valore === 'string' && normalizza(valore).includes(testo),
    )
  );
}
