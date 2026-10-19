import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { RegistroService } from '../../../core/services/registro/registro-service';
import { StoriaRecordComponent } from './storia-record-component';

describe('StoriaRecordComponent', () => {
  const registro = { leggiStoria: vi.fn() };
  const voce = {
    id: 1,
    tabella: 'prenotazioni',
    record_id: 7,
    azione: 'inserimento',
    dati_prima: null,
    dati_dopo: { codice: 'BB-7' },
    utente_id: null,
    ip: null,
    creato_il: '2030-06-01T10:00:00Z',
    utente: null,
  };

  beforeEach(() => {
    registro.leggiStoria.mockReset();
    registro.leggiStoria.mockImplementation((_t: string, _id: number, { pagina }) =>
      of({ elementi: [{ ...voce, id: pagina }], totale: 11, pagina, perPagina: 10, pagine: 2 }),
    );
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: RegistroService, useValue: registro },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
      ],
    });
  });

  it('mostra le modifiche del record, senza link, e rilegge cambiando record', async () => {
    const fixture = TestBed.createComponent(StoriaRecordComponent);
    fixture.componentRef.setInput('tabella', 'prenotazioni');
    fixture.componentRef.setInput('recordId', 7);
    await fixture.whenStable();
    const elemento = fixture.nativeElement as HTMLElement;

    expect(registro.leggiStoria).toHaveBeenCalledWith('prenotazioni', 7, {
      pagina: 1,
      perPagina: 10,
    });
    expect(elemento.textContent).toContain('BB-7');
    expect(elemento.querySelector('app-riga-registro a')).toBeNull();

    fixture.componentRef.setInput('recordId', 8);
    await fixture.whenStable();
    expect(registro.leggiStoria).toHaveBeenLastCalledWith('prenotazioni', 8, {
      pagina: 1,
      perPagina: 10,
    });
  });
});
