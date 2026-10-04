import { FormControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';

import { campiCambiati, valoriModulo } from './campi-cambiati';

describe('campiCambiati', () => {
  it('tiene i soli campi toccati e svuotati diventano null', () => {
    const nome = new FormControl('Anna');
    const note = new FormControl('');
    const email = new FormControl('a@b.it');
    nome.markAsDirty();
    note.markAsDirty();

    expect(campiCambiati({ nome, note, email })).toEqual({ nome: 'Anna', note: null });
  });
});

describe('valoriModulo', () => {
  it('tiene tutti i campi, i vuoti diventano null', () => {
    const nome = new FormControl('Anna');
    const note = new FormControl('');

    expect(valoriModulo({ nome, note })).toEqual({ nome: 'Anna', note: null });
  });
});
