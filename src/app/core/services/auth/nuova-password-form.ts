import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { LUNGHEZZA_PASSWORD } from './auth-costanti';

/** Nuova password e conferma: registrazione, reimpostazione e cambio password. */
export type NuovaPasswordForm = FormGroup<{
  password: FormControl<string>;
  conferma: FormControl<string>;
}>;

/** Errore passwordDiverse sul gruppo quando la conferma non coincide. */
export const passwordUgualiValidator: ValidatorFn = (gruppo) =>
  gruppo.get('password')?.value === gruppo.get('conferma')?.value
    ? null
    : { passwordDiverse: true };

/**
 * CREA NUOVA PASSWORD FORM
 * Stessi limiti del backend; il controllo sulla conferma sta sul gruppo, così cambiare
 * la password dopo la conferma la ricontrolla da solo.
 */
export function creaNuovaPasswordForm(fb: NonNullableFormBuilder): NuovaPasswordForm {
  return fb.group(
    {
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(LUNGHEZZA_PASSWORD.minima),
          Validators.maxLength(LUNGHEZZA_PASSWORD.massima),
        ],
      ],
      conferma: ['', Validators.required],
    },
    { validators: passwordUgualiValidator },
  );
}
