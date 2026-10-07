import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CHIAVI_IMPOSTAZIONI } from '../../../core/services/impostazioni/impostazioni-costanti';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { TariffeService } from '../../../core/services/tariffe/tariffe-service';
import { CondizioniSoggiornoInterface } from '../../../shared/models/condizioni-soggiorno/condizioni-soggiorno-model';
import { CondizioniSoggiornoComponent } from './condizioni-soggiorno-component';

describe('CondizioniSoggiornoComponent', () => {
  const tariffe = { leggiCondizioniSoggiorno: vi.fn() };
  let orari: Record<string, string>;
  const condizioni = {
    piani: [
      {
        id: 1,
        nome: 'Flessibile',
        descrizione: null,
        tipo_variazione: 'percentuale',
        valore_variazione: '0.00',
        rimborsabile: true,
        ore_cancellazione_gratuita: 48,
      },
      {
        id: 2,
        nome: 'Non rimborsabile',
        descrizione: 'Si paga subito.',
        tipo_variazione: 'percentuale',
        valore_variazione: '-10.00',
        rimborsabile: false,
        ore_cancellazione_gratuita: 0,
      },
    ],
    tassa: { nome: 'Comunale', importo_notte: '2.00', notti_max: 7, eta_esenzione: null },
  } as unknown as CondizioniSoggiornoInterface;

  beforeEach(() => {
    orari = { [CHIAVI_IMPOSTAZIONI.orarioCheckin]: '15:00' };
    tariffe.leggiCondizioniSoggiorno.mockReturnValue(of(condizioni));
    TestBed.configureTestingModule({
      imports: [
        traduzioniTest({
          camera: { soggiorno: { dalle: 'dalle {{ ora }}', tassaNotti: 'max {{ notti }} notti' } },
          conferma: { rimborsabile: 'Gratis fino a {{ ore }} ore prima' },
        }),
      ],
      providers: [
        { provide: TariffeService, useValue: tariffe },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        {
          provide: ImpostazioniService,
          useValue: { testo: (chiave: string) => orari[chiave] ?? '' },
        },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(CondizioniSoggiornoComponent);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('mostra solo gli orari impostati', async () => {
    const elemento = await crea();

    const orariMostrati = elemento.querySelectorAll('.orari li');
    expect(orariMostrati).toHaveLength(1);
    expect(orariMostrati[0].textContent).toContain('dalle 15:00');
  });

  it('ogni tariffa con la sua cancellazione; lo sconto solo se c’è', async () => {
    const elemento = await crea();

    const tariffeMostrate = [...elemento.querySelectorAll('.tariffe li')];
    expect(tariffeMostrate).toHaveLength(2);
    expect(tariffeMostrate[0].querySelector('.variazione')).toBeNull();
    expect(tariffeMostrate[0].querySelector('.regola')?.textContent).toContain(
      'Gratis fino a 48 ore prima',
    );
    expect(tariffeMostrate[1].querySelector('.variazione')?.textContent).toContain('-10');
    expect(tariffeMostrate[1].querySelector('.regola')?.textContent).toContain(
      'conferma.nonRimborsabile',
    );
    expect(tariffeMostrate[1].querySelector('.descrizione')?.textContent).toBe('Si paga subito.');
  });

  it('la tassa con le notti massime', async () => {
    const elemento = await crea();

    expect(elemento.textContent).toContain('max 7 notti');
  });

  it('senza orari, tariffe né tassa resta solo il titolo', async () => {
    orari = {};
    tariffe.leggiCondizioniSoggiorno.mockReturnValue(of({ piani: [], tassa: null }));

    const elemento = await crea();

    expect(elemento.querySelector('.orari')).toBeNull();
    expect(elemento.querySelector('.blocco')).toBeNull();
  });
});
