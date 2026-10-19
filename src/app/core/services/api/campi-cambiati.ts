import { AbstractControl } from '@angular/forms';

/**
 * Payload di un POST: tutti i campi del modulo; un testo vuoto diventa null.
 */
export function valoriModulo(controlli: Record<string, AbstractControl>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(controlli).map(([campo, controllo]) => [
      campo,
      controllo.value === '' ? null : controllo.value,
    ]),
  );
}

/**
 * Payload di un PATCH: i soli campi toccati del modulo; un testo svuotato diventa null.
 */
export function campiCambiati(controlli: Record<string, AbstractControl>): Record<string, unknown> {
  return valoriModulo(
    Object.fromEntries(Object.entries(controlli).filter(([, controllo]) => controllo.dirty)),
  );
}
