import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { CamereService } from '../../../core/services/camere/camere-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { SchedaCameraComponent } from './scheda-camera-component';

describe('SchedaCameraComponent', () => {
  const camere = {
    leggiCamera: vi.fn(),
    elencaTipologie: vi.fn(),
    eliminaCamera: vi.fn(),
    elencaServizi: vi.fn(),
  };
  const camera = {
    id: 4,
    numero: '101',
    nome: null,
    tipologia_id: 2,
    piano: 1,
    ospiti_max: null,
    stato: 'attiva',
    note: null,
    tipologia: { id: 2, nome: 'Doppia' },
  };

  beforeEach(() => {
    Object.values(camere).forEach((spia) => spia.mockReset());
    camere.leggiCamera.mockReturnValue(of(camera));
    camere.elencaTipologie.mockReturnValue(of([{ id: 2, nome: 'Doppia' }]));
    camere.elencaServizi.mockReturnValue(of([]));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: CamereService, useValue: camere },
        { provide: AvvisiService, useValue: { mostra: vi.fn() } },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(SchedaCameraComponent);
    fixture.componentRef.setInput('id', '4');
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('mostra il modulo della camera col link alla sua tipologia', async () => {
    const elemento = await crea();

    expect(camere.leggiCamera).toHaveBeenCalledWith(4);
    expect(elemento.querySelector('.introduzione')?.getAttribute('href')).toBe(
      '/staff/camere/tipologie/2',
    );
    expect(elemento.querySelector('app-dati-camera')).not.toBeNull();
    expect(elemento.querySelector('app-elimina')).not.toBeNull();
  });

  it('se la camera non esiste lo dice', async () => {
    camere.leggiCamera.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            error: { errore: { codice: 'CAMERA_NON_TROVATA', messaggio: 'Non trovata' } },
          }),
      ),
    );
    const elemento = await crea();

    expect(elemento.querySelector('[role=alert]')).not.toBeNull();
    expect(elemento.querySelector('app-dati-camera')).toBeNull();
  });
});
