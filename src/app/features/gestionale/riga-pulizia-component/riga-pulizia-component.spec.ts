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

  function crea(dati: Partial<AttivitaPuliziaInterface> = {}, tempi = false) {
    const fixture = TestBed.createComponent(RigaPuliziaComponent);
    fixture.componentRef.setInput('attivita', { ...attivita, ...dati });
    fixture.componentRef.setInput('tempi', tempi);
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

  it('piano, non disturbare e, a chi gestisce, quanto è durata', () => {
    const camera = { numero: '201', piano: 2 } as AttivitaPuliziaInterface['camera'];
    const rinviata = crea({ camera, stato: 'da_fare', rinviata_il: '2026-10-04T10:00:00.000Z' });
    expect(rinviata.textContent).toContain('gestionale.pulizie.piano');
    expect(rinviata.querySelector('[data-stato=rinviata]')).not.toBeNull();

    const tempi = {
      iniziata_il: '2026-10-04T09:00:00.000Z',
      completata_il: '2026-10-04T09:20:00.000Z',
    };
    expect(crea({ ...tempi, stato: 'completata' }, true).textContent).toContain(
      'gestionale.pulizie.minuti',
    );
    expect(crea({ ...tempi, stato: 'completata' }).textContent).not.toContain(
      'gestionale.pulizie.minuti',
    );
  });
});
