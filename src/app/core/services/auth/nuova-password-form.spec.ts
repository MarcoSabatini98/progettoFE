import { TestBed } from '@angular/core/testing';
import { NonNullableFormBuilder } from '@angular/forms';
import { describe, expect, it } from 'vitest';

import { creaNuovaPasswordForm } from './nuova-password-form';

describe('creaNuovaPasswordForm', () => {
  function crea(password: string, conferma: string) {
    const gruppo = creaNuovaPasswordForm(TestBed.inject(NonNullableFormBuilder));
    gruppo.setValue({ password, conferma });
    return gruppo;
  }

  it('accetta password lunga abbastanza e conferma uguale', () => {
    expect(crea('segreta-123', 'segreta-123').valid).toBe(true);
  });

  it('segnala sul gruppo la conferma diversa', () => {
    expect(crea('segreta-123', 'segreta-124').errors).toEqual({ passwordDiverse: true });
  });

  it('ricontrolla la conferma quando cambia la password', () => {
    const gruppo = crea('segreta-123', 'segreta-123');

    gruppo.controls.password.setValue('segreta-999');

    expect(gruppo.hasError('passwordDiverse')).toBe(true);
  });

  it('rifiuta la password troppo corta', () => {
    expect(crea('corta', 'corta').controls.password.hasError('minlength')).toBe(true);
  });
});
