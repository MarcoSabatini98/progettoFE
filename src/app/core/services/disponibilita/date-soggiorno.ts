import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Data di calendario locale 'AAAA-MM-GG', il formato di arrivo e partenza nell'API. */
export function dataCalendario(giorno: Date): string {
  const mese = String(giorno.getMonth() + 1).padStart(2, '0');
  const numero = String(giorno.getDate()).padStart(2, '0');
  return `${giorno.getFullYear()}-${mese}-${numero}`;
}

/** Giorno dopo una data 'AAAA-MM-GG': la prima partenza possibile per quell'arrivo. */
export function giornoDopo(data: string): string {
  const giorno = new Date(`${data}T00:00`);
  giorno.setDate(giorno.getDate() + 1);
  return dataCalendario(giorno);
}

/** Sul gruppo con arrivo e partenza: errore partenzaPrimaArrivo se la partenza non viene dopo. */
export const partenzaDopoArrivo: ValidatorFn = (
  gruppo: AbstractControl,
): ValidationErrors | null => {
  const { arrivo, partenza } = gruppo.value as { arrivo?: string; partenza?: string };
  return arrivo && partenza && partenza <= arrivo ? { partenzaPrimaArrivo: true } : null;
};
