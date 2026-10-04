import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { SegnalazioneManutenzioneInterface } from '../../../shared/models/segnalazione-manutenzione/segnalazione-manutenzione-model';
import { RigaSegnalazioneComponent } from './riga-segnalazione-component';

describe('RigaSegnalazioneComponent', () => {
  const segnalazione = {
    id: 7,
    titolo: 'Rubinetto che perde',
    priorita: 'normale',
    stato: 'in_corso',
    creato_il: '2030-06-01T08:00:00Z',
    camera: { numero: '101' },
    incaricato: { nome: 'Luca', cognome: 'Neri' },
  } as unknown as SegnalazioneManutenzioneInterface;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [provideRouter([]), { provide: LinguaService, useValue: { attiva: () => 'it' } }],
    });
  });

  function crea(dati: Partial<SegnalazioneManutenzioneInterface> = {}) {
    const fixture = TestBed.createComponent(RigaSegnalazioneComponent);
    fixture.componentRef.setInput('segnalazione', { ...segnalazione, ...dati });
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('porta alla scheda con camera, titolo e incaricato', () => {
    const elemento = crea();

    expect(elemento.querySelector('a')?.getAttribute('href')).toBe('/staff/manutenzione/7');
    expect(elemento.querySelector('.camera')?.textContent).toContain('101');
    expect(elemento.textContent).toContain('Rubinetto che perde');
    expect(elemento.textContent).toContain('Luca Neri');
    expect(elemento.querySelectorAll('.stato-prenotazione')).toHaveLength(1);
  });

  it('segnala le urgenti, le aree comuni e chi non è in carico a nessuno', () => {
    const elemento = crea({ priorita: 'urgente', camera: null, incaricato: null });

    expect(elemento.querySelectorAll('.stato-prenotazione')).toHaveLength(2);
    expect(elemento.textContent).toContain('gestionale.manutenzione.areaComune');
    expect(elemento.textContent).toContain('gestionale.manutenzione.libera');
  });
});
