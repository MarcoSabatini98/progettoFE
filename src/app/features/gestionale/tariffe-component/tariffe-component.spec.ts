import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CamereService } from '../../../core/services/camere/camere-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { TariffeService } from '../../../core/services/tariffe/tariffe-service';
import { TariffeComponent } from './tariffe-component';

describe('TariffeComponent', () => {
  const nessuno = () => vi.fn(() => of([]));
  const tariffe = {
    elencaPiani: nessuno(),
    elencaPeriodi: nessuno(),
    elencaPromozioni: nessuno(),
    elencaCodiciSconto: nessuno(),
    elencaPacchetti: nessuno(),
    elencaTasse: nessuno(),
  };
  const camere = { elencaTipologie: nessuno(), elencaServizi: nessuno() };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: TariffeService, useValue: tariffe },
        { provide: CamereService, useValue: camere },
      ],
    });
  });

  it('apre sui piani e cambia sezione con le linguette', async () => {
    const fixture = TestBed.createComponent(TariffeComponent);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const linguette = elemento.querySelectorAll<HTMLButtonElement>('.linguette button');

    expect(linguette).toHaveLength(6);
    expect(elemento.querySelector('app-piani-tariffari')).not.toBeNull();
    expect(camere.elencaTipologie).toHaveBeenCalledOnce();

    linguette[5].click();
    await fixture.whenStable();

    expect(linguette[5].getAttribute('aria-pressed')).toBe('true');
    expect(elemento.querySelector('app-piani-tariffari')).toBeNull();
    expect(elemento.querySelector('app-tasse-soggiorno')).not.toBeNull();
    expect(tariffe.elencaTasse).toHaveBeenCalled();
  });
});
