import { TestBed } from '@angular/core/testing';
import { NonNullableFormBuilder } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';

import { creaNuovaPasswordForm } from '../../core/services/auth/nuova-password-form';
import { traduzioniTest } from '../../core/services/lingua/configura-transloco-test';
import { NuovaPasswordComponent } from './nuova-password-component';

describe('NuovaPasswordComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        traduzioniTest({
          moduli: { required: 'Obbligatorio', passwordDiverse: 'Le password non coincidono' },
        }),
      ],
    });
  });

  async function crea() {
    const gruppo = creaNuovaPasswordForm(TestBed.inject(NonNullableFormBuilder));
    const fixture = TestBed.createComponent(NuovaPasswordComponent);
    fixture.componentRef.setInput('gruppo', gruppo);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const errori = () =>
      Array.from(elemento.querySelectorAll('.campo-errore'), (e) => e.textContent?.trim());
    return { fixture, gruppo, elemento, errori };
  }

  it('scrive nei controlli del gruppo', async () => {
    const { gruppo, elemento } = await crea();
    const [password] = elemento.querySelectorAll('input');

    password.value = 'segreta-123';
    password.dispatchEvent(new Event('input'));

    expect(gruppo.controls.password.value).toBe('segreta-123');
  });

  it('mostra gli errori quando il genitore segna tutto come toccato', async () => {
    const { fixture, gruppo, errori } = await crea();

    gruppo.markAllAsTouched();
    await fixture.whenStable();

    expect(errori()).toEqual(['Obbligatorio', 'Obbligatorio']);
  });

  it('segnala la conferma diversa sotto il secondo campo', async () => {
    const { fixture, gruppo, errori } = await crea();

    gruppo.setValue({ password: 'segreta-123', conferma: 'segreta-124' });
    gruppo.markAllAsTouched();
    await fixture.whenStable();

    expect(errori()).toEqual(['Le password non coincidono']);
  });
});
