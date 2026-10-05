/** Copia dell'insieme col valore aggiunto (spuntato) o tolto: per le caselle tenute in un signal. */
export function conSpunta<T>(insieme: ReadonlySet<T>, valore: T, spuntato: boolean): Set<T> {
  const copia = new Set(insieme);
  if (spuntato) copia.add(valore);
  else copia.delete(valore);
  return copia;
}
