import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { CHIAVI_IMPOSTAZIONI } from '../../../core/services/impostazioni/impostazioni-costanti';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { ContattiComponent } from './contatti-component';

describe('ContattiComponent', () => {
  async function crea(indirizzo: string, impostazioni: Record<string, string>) {
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        {
          provide: ImpostazioniService,
          useValue: {
            indirizzo: signal(indirizzo),
            testo: (chiave: string) => impostazioni[chiave] ?? '',
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(ContattiComponent);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('mostra indirizzo con la mappa, email e telefono come link', async () => {
    const elemento = await crea('Via Roma 1, 07041 Alghero (SS)', {
      [CHIAVI_IMPOSTAZIONI.email]: 'info@casa.it',
      [CHIAVI_IMPOSTAZIONI.telefono]: '+39 079 123456',
    });

    expect(elemento.querySelector('address')?.textContent).toBe('Via Roma 1, 07041 Alghero (SS)');
    expect(elemento.querySelector('.esterno')?.getAttribute('href')).toBe(
      'https://www.google.com/maps/search/?api=1&query=Via%20Roma%201%2C%2007041%20Alghero%20(SS)',
    );
    expect([...elemento.querySelectorAll('a')].map((a) => a.getAttribute('href')).slice(1)).toEqual(
      ['mailto:info@casa.it', 'tel:+39 079 123456'],
    );
  });

  it('salta le voci che la struttura non ha impostato', async () => {
    const elemento = await crea('', { [CHIAVI_IMPOSTAZIONI.orarioCheckin]: '15:00' });

    expect(elemento.querySelectorAll('.contatto')).toHaveLength(1);
    expect(elemento.querySelector('.contatto p')?.textContent).toContain('contatti.checkin');
  });
});
