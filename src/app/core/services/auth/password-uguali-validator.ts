import { ValidatorFn } from '@angular/forms';

/**
 * Sul campo di conferma: errore passwordDiverse se non coincide con il campo indicato
 * dello stesso gruppo. Rivalidare la conferma prima dell'invio: cambiare la password
 * dopo non la ricontrolla da sola.
 */
export function passwordUgualiValidator(campo: string): ValidatorFn {
  return (conferma) =>
    conferma.value === conferma.parent?.get(campo)?.value ? null : { passwordDiverse: true };
}
