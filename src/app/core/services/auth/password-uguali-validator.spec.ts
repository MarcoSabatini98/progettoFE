import { FormControl, FormGroup } from '@angular/forms';
import { describe, expect, it } from 'vitest';

import { passwordUgualiValidator } from './password-uguali-validator';

describe('passwordUgualiValidator', () => {
  function crea(password: string, conferma: string) {
    const gruppo = new FormGroup({
      password: new FormControl(password),
      conferma: new FormControl(conferma, passwordUgualiValidator('password')),
    });
    gruppo.controls.conferma.updateValueAndValidity();
    return gruppo;
  }

  it('accetta la conferma uguale alla password', () => {
    expect(crea('segreta-123', 'segreta-123').controls.conferma.errors).toBeNull();
  });

  it('segnala la conferma diversa', () => {
    expect(crea('segreta-123', 'segreta-124').controls.conferma.errors).toEqual({
      passwordDiverse: true,
    });
  });
});
