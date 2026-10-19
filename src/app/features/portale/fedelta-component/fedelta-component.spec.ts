import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FedeltaService } from '../../../core/services/fedelta/fedelta-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { FedeltaComponent } from './fedelta-component';

describe('FedeltaComponent', () => {
  const fedelta = {
    leggiSituazione: vi.fn(),
    elencaLivelli: vi.fn(),
    leggiMieStatistiche: vi.fn(),
    elencaMovimenti: vi.fn(),
  };
  const livelli = [
    {
      id: 1,
      codice: 'bronze',
      nome: 'Bronze',
      punti_minimi: 0,
      sconto_percentuale: 0,
      colore: null,
    },
    {
      id: 2,
      codice: 'silver',
      nome: 'Silver',
      punti_minimi: 100,
      sconto_percentuale: 5,
      colore: '#c0c0c0',
    },
  ];
  const movimento = (id: number, punti: number) => ({
    id,
    punti,
    motivo: 'soggiorno',
    note: null,
    creato_il: '2026-07-04T10:00:00Z',
    prenotazione: { codice: `BB-${id}` },
  });
  const pagina = (numero: number, pagine: number, elementi: unknown[]) =>
    of({ elementi, totale: 3, pagina: numero, perPagina: 20, pagine });

  beforeEach(() => {
    Object.values(fedelta).forEach((spia) => spia.mockReset());
    fedelta.elencaLivelli.mockReturnValue(of(livelli));
    fedelta.leggiMieStatistiche.mockReturnValue(
      of({ anno: 2026, punti_guadagnati: 70, punti_tolti: 10 }),
    );
    fedelta.elencaMovimenti.mockReturnValue(pagina(1, 1, []));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: FedeltaService, useValue: fedelta },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(FedeltaComponent);
    await fixture.whenStable();
    return { fixture, elemento: fixture.nativeElement as HTMLElement };
  }

  it('mostra il livello, la strada verso il prossimo e segna il livello attuale', async () => {
    fedelta.leggiSituazione.mockReturnValue(
      of({ livello_id: 1, livello_nome: 'Bronze', punti_fedelta: 60, sconto_percentuale: 0 }),
    );

    const { elemento } = await crea();

    expect(elemento.querySelector('.badge')?.textContent).toContain('Bronze');
    const progresso = elemento.querySelector('progress')!;
    expect([progresso.value, progresso.max]).toEqual([60, 100]);
    expect(elemento.querySelector('[aria-current="true"] .nome')?.textContent).toBe('Bronze');
    expect(elemento.querySelectorAll('.dati dd')[0].textContent).toBe('70');
  });

  it('cliente senza punti: invito a iniziare, obiettivo il primo livello utile', async () => {
    fedelta.leggiSituazione.mockReturnValue(of(null));

    const { elemento } = await crea();

    expect(elemento.querySelector('.badge')).toBeNull();
    expect(elemento.textContent).toContain('portale.fedelta.inizia');
    expect(elemento.querySelector('progress')?.max).toBe(100);
    expect(elemento.querySelector('.stato-vuoto')?.textContent).toContain(
      'portale.fedelta.nessunMovimento',
    );
  });

  it('al livello più alto niente barra', async () => {
    fedelta.leggiSituazione.mockReturnValue(
      of({ livello_id: 2, livello_nome: 'Silver', punti_fedelta: 150, sconto_percentuale: 5 }),
    );

    const { elemento } = await crea();

    expect(elemento.querySelector('progress')).toBeNull();
    expect(elemento.textContent).toContain('portale.fedelta.massimo');
  });

  it('accoda i movimenti col segno', async () => {
    fedelta.leggiSituazione.mockReturnValue(of(null));
    fedelta.elencaMovimenti
      .mockReturnValueOnce(pagina(1, 2, [movimento(1, 40)]))
      .mockReturnValueOnce(pagina(2, 2, [movimento(2, -10)]));
    const { fixture, elemento } = await crea();

    elemento.querySelector<HTMLButtonElement>('.altre')?.click();
    await fixture.whenStable();

    expect(fedelta.elencaMovimenti).toHaveBeenLastCalledWith({ pagina: 2, perPagina: 20 });
    expect(
      [...elemento.querySelectorAll('.variazione')].map((punti) => punti.textContent?.trim()),
    ).toEqual(['+40', '-10']);
    expect(elemento.querySelector('.negativa')?.textContent?.trim()).toBe('-10');
    expect(elemento.querySelector('.altre')).toBeNull();
  });
});
