import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AvvisiService } from '../avvisi/avvisi-service';
import { traduzioniTest } from '../lingua/configura-transloco-test';
import { Listino } from './listino';

interface Voce {
  id: number;
  nome: string;
  prezzo: string;
  extra: { id: number }[];
}

describe('Listino', () => {
  const voce: Voce = { id: 3, nome: 'Estate', prezzo: '80.50', extra: [{ id: 9 }] };
  let richieste: Record<'elenca' | 'crea' | 'aggiorna' | 'elimina', ReturnType<typeof vi.fn>>;
  let avvisi: { mostra: ReturnType<typeof vi.fn> };
  let listino: Listino<Voce, Omit<Voce, 'id'>>;
  let modulo: FormGroup;
  const stabile = () => TestBed.inject(ApplicationRef).whenStable();

  beforeEach(async () => {
    richieste = {
      elenca: vi.fn(() => of([voce])),
      crea: vi.fn(() => of(voce)),
      aggiorna: vi.fn(() => of(voce)),
      elimina: vi.fn(() => of(null)),
    };
    avvisi = { mostra: vi.fn() };
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [{ provide: AvvisiService, useValue: avvisi }],
    });
    modulo = new FormGroup({
      nome: new FormControl('Nuova', { nonNullable: true, validators: Validators.required }),
      note: new FormControl('', { nonNullable: true }),
      prezzo: new FormControl<number | null>(null),
      extra: new FormControl<number[]>([], { nonNullable: true }),
    });
    listino = TestBed.runInInjectionContext(
      () =>
        new Listino(richieste as never, modulo, (scelta: Voce) => ({
          extra: scelta.extra.map((servizio) => servizio.id),
        })),
    );
    await stabile();
  });

  it('carica l’elenco', () => {
    expect(listino.elenco.value()).toEqual([voce]);
  });

  it('la scelta compila il modulo (decimali come numeri), una nuova lo riporta all’inizio', async () => {
    listino.scegli(voce);
    await stabile();
    expect(modulo.getRawValue()).toEqual({ nome: 'Estate', note: '', prezzo: 80.5, extra: [9] });

    listino.scegli(null);
    await stabile();
    expect(modulo.getRawValue()).toEqual({ nome: 'Nuova', note: '', prezzo: null, extra: [] });
  });

  it('nuova: crea con tutti i campi e la tiene scelta', async () => {
    listino.salva();
    await stabile();

    expect(richieste.crea).toHaveBeenCalledWith({
      nome: 'Nuova',
      note: null,
      prezzo: null,
      extra: [],
    });
    expect(listino.scelta()).toBe(voce);
    expect(avvisi.mostra).toHaveBeenCalledWith(expect.any(String), 'successo');
    expect(richieste.elenca).toHaveBeenCalledTimes(2);
  });

  it('scelta: manda i soli campi cambiati, niente se non cambia nulla', async () => {
    listino.scegli(voce);
    await stabile();
    listino.salva();
    expect(richieste.aggiorna).not.toHaveBeenCalled();

    modulo.controls['nome'].setValue('Estate alta');
    modulo.controls['nome'].markAsDirty();
    listino.salva();

    expect(richieste.aggiorna).toHaveBeenCalledWith(3, { nome: 'Estate alta' });
  });

  it('un modulo non valido non parte', () => {
    modulo.controls['nome'].setValue('');
    listino.salva();

    expect(richieste.crea).not.toHaveBeenCalled();
    expect(modulo.controls['nome'].touched).toBe(true);
  });

  it('un errore del backend resta da mostrare', () => {
    richieste.crea.mockReturnValue(throwError(() => new Error('no')));
    listino.salva();

    expect(listino.errore()).not.toBe('');
    expect(listino.inCorso()).toBe(false);
  });

  it('elimina la scelta e torna a una voce nuova', () => {
    listino.scegli(voce);
    listino.elimina().subscribe();
    listino.ricarica();

    expect(richieste.elimina).toHaveBeenCalledWith(3);
    expect(listino.scelta()).toBeNull();
  });

  it('nuova da: una voce nuova che parte dai valori dati, poi una nuova torna all’inizio', async () => {
    listino.scegli(voce);
    await stabile();
    listino.nuovaDa({ nome: 'Estate 2027' });
    await stabile();

    expect(listino.scelta()).toBeNull();
    expect(modulo.getRawValue()).toEqual({
      nome: 'Estate 2027',
      note: '',
      prezzo: null,
      extra: [],
    });

    listino.scegli(null);
    await stabile();
    expect(modulo.getRawValue().nome).toBe('Nuova');
  });
});
