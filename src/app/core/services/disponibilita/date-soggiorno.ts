import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Data di calendario locale 'AAAA-MM-GG', il formato di arrivo e partenza nell'API. */
export function dataCalendario(giorno: Date): string {
  const mese = String(giorno.getMonth() + 1).padStart(2, '0');
  const numero = String(giorno.getDate()).padStart(2, '0');
  return `${giorno.getFullYear()}-${mese}-${numero}`;
}

/** Data 'AAAA-MM-GG' spostata di quanti giorni (anche indietro). */
export function spostaData(data: string, giorni: number): string {
  const giorno = new Date(`${data}T00:00`);
  giorno.setDate(giorno.getDate() + giorni);
  return dataCalendario(giorno);
}

/** Giorno dopo una data 'AAAA-MM-GG': la prima partenza possibile per quell'arrivo. */
export function giornoDopo(data: string): string {
  return spostaData(data, 1);
}

/** Giorni da una data 'AAAA-MM-GG' all'altra. In UTC: l'ora legale non sposta il conto. */
export function giorniTra(dal: string, al: string): number {
  return Math.round((Date.parse(al) - Date.parse(dal)) / 86_400_000);
}

/** Primo giorno del mese di una data 'AAAA-MM-GG'. */
export function primoDelMese(data: string): string {
  return `${data.slice(0, 7)}-01`;
}

/** Primo giorno del mese spostato di quanti mesi (anche indietro), da un primo del mese. */
export function spostaMese(mese: string, mesi: number): string {
  const [anno, numero] = mese.split('-').map(Number);
  return dataCalendario(new Date(anno, numero - 1 + mesi, 1));
}

/** Sul gruppo con arrivo e partenza: errore partenzaPrimaArrivo se la partenza non viene dopo. */
export const partenzaDopoArrivo: ValidatorFn = (
  gruppo: AbstractControl,
): ValidationErrors | null => {
  const { arrivo, partenza } = gruppo.value as { arrivo?: string; partenza?: string };
  return arrivo && partenza && partenza <= arrivo ? { partenzaPrimaArrivo: true } : null;
};
