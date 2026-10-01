import { AbstractControl } from '@angular/forms';

/**
 * Payload di un PATCH: i soli campi toccati del modulo; un testo svuotato diventa null.
 */
export function campiCambiati(controlli: Record<string, AbstractControl>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(controlli)
      .filter(([, controllo]) => controllo.dirty)
      .map(([campo, controllo]) => [campo, controllo.value === '' ? null : controllo.value]),
  );
}
