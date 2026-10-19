import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { PrenotazioneInterface } from '../../../shared/models/prenotazione/prenotazione-model';
import { RigaPrenotazioneComponent } from './riga-prenotazione-component';

describe('RigaPrenotazioneComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  it('mostra camera, titolare e stato e porta alla scheda', async () => {
    const fixture = TestBed.createComponent(RigaPrenotazioneComponent);
    fixture.componentRef.setInput('prenotazione', {
      id: 7,
      codice: 'BB-7',
      stato: 'confermata',
      data_arrivo: '2030-07-01',
      data_partenza: '2030-07-04',
      adulti: 2,
      bambini: 0,
      camera: { numero: '12' },
      titolare: { nome: 'Anna', cognome: 'Rossi' },
    } as unknown as PrenotazioneInterface);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;

    expect(elemento.querySelector('a')?.getAttribute('href')).toBe('/staff/prenotazioni/7');
    expect(elemento.querySelector('.camera')?.textContent).toContain('12');
    expect(elemento.querySelector('strong')?.textContent).toContain('Rossi Anna');
    expect(elemento.querySelector('[data-stato]')?.textContent).toContain(
      'prenotazione.stati.confermata',
    );
  });
});
