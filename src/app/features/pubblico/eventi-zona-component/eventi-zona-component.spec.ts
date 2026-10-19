import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ContenutiService } from '../../../core/services/contenuti/contenuti-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { EventoPubblicoInterface } from '../../../shared/models/evento-speciale/evento-speciale-model';
import { EventiZonaComponent } from './eventi-zona-component';

describe('EventiZonaComponent', () => {
  const sagra: EventoPubblicoInterface = {
    id: 1,
    titolo: 'Fish festival',
    tipo: 'evento_locale',
    data_inizio: '2030-07-14',
    data_fine: '2030-07-16',
  };
  const contenuti = { elencaEventiPubblici: vi.fn() };

  beforeEach(() => {
    contenuti.elencaEventiPubblici.mockReset();
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: ContenutiService, useValue: contenuti },
        { provide: LinguaService, useValue: { attiva: () => 'en' } },
      ],
    });
  });

  async function crea(eventi: EventoPubblicoInterface[]) {
    contenuti.elencaEventiPubblici.mockReturnValue(of(eventi));
    const fixture = TestBed.createComponent(EventiZonaComponent);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('mostra gli eventi nella lingua del sito, con le date', async () => {
    const elemento = await crea([sagra, { ...sagra, id: 2, data_fine: sagra.data_inizio }]);

    expect(contenuti.elencaEventiPubblici).toHaveBeenCalledWith('en');
    expect(elemento.querySelector('h2')?.textContent).toContain('attivita.eventi.titolo');
    const schede = elemento.querySelectorAll('.evento');
    expect(schede[0].textContent).toContain('Fish festival');
    expect(schede[0].textContent).toContain('attivita.eventi.tipi.evento_locale');
    expect(schede[0].querySelectorAll('time')).toHaveLength(2);
    expect(schede[1].querySelectorAll('time')).toHaveLength(1);
  });

  it('senza eventi la sezione non compare', async () => {
    const elemento = await crea([]);

    expect(elemento.querySelector('section')).toBeNull();
  });
});
