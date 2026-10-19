import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { RecensioneInterface } from '../../../shared/models/recensione/recensione-model';
import { RigaRecensioneComponent } from './riga-recensione-component';

describe('RigaRecensioneComponent', () => {
  const recensione = {
    id: 9,
    voto: 2,
    titolo: 'Rumorosa',
    commento: 'Camera sulla strada, poco sonno.',
    stato: 'in_attesa',
    creato_il: '2030-06-01T08:00:00Z',
    ospite: { nome: 'Anna', cognome: 'Bianchi' },
    prenotazione: { codice: 'BB-123' },
  } as unknown as RecensioneInterface;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [provideRouter([]), { provide: LinguaService, useValue: { attiva: () => 'it' } }],
    });
  });

  function crea(dati: Partial<RecensioneInterface> = {}) {
    const fixture = TestBed.createComponent(RigaRecensioneComponent);
    fixture.componentRef.setInput('recensione', { ...recensione, ...dati });
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('porta alla scheda con voto, titolo, ospite e stato', () => {
    const elemento = crea();

    expect(elemento.querySelector('a')?.getAttribute('href')).toBe('/staff/recensioni/9');
    expect(elemento.querySelector('.camera')?.textContent).toContain('2');
    expect(elemento.querySelector('strong')?.textContent).toContain('Rumorosa');
    expect(elemento.textContent).toContain('Anna Bianchi');
    expect(elemento.textContent).toContain('BB-123');
    expect(elemento.querySelector('.stato-prenotazione')?.getAttribute('data-stato')).toBe(
      'in_attesa',
    );
  });

  it('senza titolo mostra l inizio del commento, senza testo lo dice', () => {
    expect(crea({ titolo: null }).querySelector('strong')?.textContent).toContain(
      'Camera sulla strada',
    );
    expect(crea({ titolo: null, commento: null }).querySelector('strong')?.textContent).toContain(
      'gestionale.recensioni.senzaTesto',
    );
  });
});
