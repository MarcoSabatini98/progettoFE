import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { PulizieService } from '../../../core/services/pulizie/pulizie-service';
import { SchedaPuliziaComponent } from './scheda-pulizia-component';

describe('SchedaPuliziaComponent', () => {
  const pulizie = {
    leggiAttivita: vi.fn(),
    eliminaAttivita: vi.fn(),
    elencaAddetti: vi.fn(),
    avanzaAttivita: vi.fn(),
  };
  const auth = { haPermessi: vi.fn(), utente: () => ({ id: 3 }) };
  const attivita = {
    id: 9,
    assegnata_a: null,
    data_prevista: '2030-06-01',
    tipo: 'partenza',
    priorita: 'alta',
    stato: 'da_fare',
    checklist: [],
    note: null,
    camera: { numero: '101' },
    prenotazione: { codice: 'BB-7', data_partenza: '2030-06-01' },
  };

  beforeEach(() => {
    Object.values(pulizie).forEach((spia) => spia.mockReset());
    pulizie.leggiAttivita.mockReturnValue(of(attivita));
    pulizie.elencaAddetti.mockReturnValue(of([]));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: PulizieService, useValue: pulizie },
        { provide: AuthService, useValue: auth },
        { provide: AvvisiService, useValue: { mostra: vi.fn() } },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  async function crea(gestore = true) {
    auth.haPermessi.mockReturnValue(gestore);
    const fixture = TestBed.createComponent(SchedaPuliziaComponent);
    fixture.componentRef.setInput('id', '9');
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('chi gestisce lavora, pianifica ed elimina un attività da fare', async () => {
    const elemento = await crea();

    expect(pulizie.leggiAttivita).toHaveBeenCalledWith(9);
    expect(elemento.textContent).toContain('BB-7');
    expect(elemento.querySelector('app-lavoro-pulizia')).not.toBeNull();
    expect(elemento.querySelector('app-dati-pulizia')).not.toBeNull();
    expect(elemento.querySelector('app-elimina')).not.toBeNull();
  });

  it('all addetto lascia solo il lavoro', async () => {
    const elemento = await crea(false);

    expect(elemento.querySelector('app-lavoro-pulizia')).not.toBeNull();
    expect(elemento.querySelector('app-dati-pulizia')).toBeNull();
    expect(elemento.querySelector('app-elimina')).toBeNull();
  });

  it('un attività verificata non si pianifica più', async () => {
    pulizie.leggiAttivita.mockReturnValue(of({ ...attivita, stato: 'verificata' }));
    const elemento = await crea();

    expect(elemento.querySelector('app-dati-pulizia')).toBeNull();
    expect(elemento.querySelector('app-elimina')).toBeNull();
  });

  it('mostra l errore se l attività non esiste', async () => {
    pulizie.leggiAttivita.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 404, error: {} })),
    );
    const elemento = await crea();

    expect(elemento.querySelector('[role=alert]')).not.toBeNull();
  });
});
