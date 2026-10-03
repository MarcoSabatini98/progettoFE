import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { AttivitaPuliziaInterface } from '../../../shared/models/attivita-pulizia/attivita-pulizia-model';
import { RigaPuliziaComponent } from './riga-pulizia-component';

describe('RigaPuliziaComponent', () => {
  const attivita = {
    id: 9,
    tipo: 'partenza',
    priorita: 'normale',
    stato: 'in_corso',
    checklist: [
      { voce: 'Bagno', fatto: true },
      { voce: 'Letti', fatto: false },
    ],
    camera: { numero: '101' },
    addetto: { nome: 'Anna', cognome: 'Bianchi' },
  } as unknown as AttivitaPuliziaInterface;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [provideRouter([])],
    });
  });

  function crea(dati: Partial<AttivitaPuliziaInterface> = {}) {
    const fixture = TestBed.createComponent(RigaPuliziaComponent);
    fixture.componentRef.setInput('attivita', { ...attivita, ...dati });
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('porta alla scheda con camera, addetto e voci spuntate', () => {
    const elemento = crea();

    expect(elemento.querySelector('a')?.getAttribute('href')).toBe('/staff/pulizie/9');
    expect(elemento.querySelector('.camera')?.textContent).toContain('101');
    expect(elemento.textContent).toContain('Anna Bianchi');
    expect(elemento.textContent).toContain('gestionale.pulizie.vociFatte');
    expect(elemento.querySelectorAll('.stato-prenotazione')).toHaveLength(1);
  });

  it('segnala le urgenti e le attività senza addetto', () => {
    const elemento = crea({ priorita: 'urgente', addetto: null });

    expect(elemento.querySelectorAll('.stato-prenotazione')).toHaveLength(2);
    expect(elemento.textContent).toContain('gestionale.pulizie.libera');
  });
});
