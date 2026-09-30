import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { CHIAVI_IMPOSTAZIONI } from '../../../core/services/impostazioni/impostazioni-costanti';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { HomeComponent } from './home-component';

describe('HomeComponent', () => {
  async function crea(impostazioni: Record<string, string>) {
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        {
          provide: ImpostazioniService,
          useValue: { testo: (chiave: string) => impostazioni[chiave] ?? '' },
        },
      ],
    });
    const fixture = TestBed.createComponent(HomeComponent);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('mostra nome, località e orari della struttura', async () => {
    const elemento = await crea({
      [CHIAVI_IMPOSTAZIONI.nome]: 'Casa del Mare',
      [CHIAVI_IMPOSTAZIONI.comune]: 'Alghero',
      [CHIAVI_IMPOSTAZIONI.orarioCheckin]: '15:00',
      [CHIAVI_IMPOSTAZIONI.orarioCheckout]: '10:30',
    });

    expect(elemento.querySelector('h1')?.textContent).toBe('Casa del Mare');
    expect(elemento.querySelector('.luogo')?.textContent).toContain('Alghero');
    expect([...elemento.querySelectorAll('dd')].map((dd) => dd.textContent)).toEqual([
      '15:00',
      '10:30',
    ]);
  });

  it('senza orari non mostra il riquadro', async () => {
    const elemento = await crea({ [CHIAVI_IMPOSTAZIONI.nome]: 'Casa del Mare' });

    expect(elemento.querySelector('.orari')).toBeNull();
  });
});
