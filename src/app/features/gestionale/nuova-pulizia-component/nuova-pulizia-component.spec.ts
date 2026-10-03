import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CamereService } from '../../../core/services/camere/camere-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { PulizieService } from '../../../core/services/pulizie/pulizie-service';
import { NuovaPuliziaComponent } from './nuova-pulizia-component';

describe('NuovaPuliziaComponent', () => {
  const pulizie = { elencaAddetti: vi.fn(), creaAttivita: vi.fn() };
  const camere = { elencaCamere: vi.fn() };

  beforeEach(() => {
    [...Object.values(pulizie), camere.elencaCamere].forEach((spia) => spia.mockReset());
    camere.elencaCamere.mockReturnValue(of([{ id: 4, numero: '101' }]));
    pulizie.elencaAddetti.mockReturnValue(of([{ id: 3, nome: 'Anna', cognome: 'Bianchi' }]));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: PulizieService, useValue: pulizie },
        { provide: CamereService, useValue: camere },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(NuovaPuliziaComponent);
    fixture.componentRef.setInput('giorno', '2030-06-01');
    await fixture.whenStable();
    const elemento = fixture.nativeElement as HTMLElement;
    const [camera, , , addetto] = Array.from(elemento.querySelectorAll('select'));
    return { fixture, elemento, camera, addetto };
  }

  function scegli(campo: HTMLSelectElement, indice: number): void {
    campo.selectedIndex = indice;
    campo.dispatchEvent(new Event('change'));
  }

  it('crea l attività del giorno con camera e addetto', async () => {
    pulizie.creaAttivita.mockReturnValue(of({ id: 9 }));
    const { fixture, elemento, camera, addetto } = await crea();
    const creata = vi.fn();
    fixture.componentInstance.creata.subscribe(creata);

    scegli(camera, 0);
    scegli(addetto, 1);
    elemento.querySelector('form')!.dispatchEvent(new Event('submit'));

    expect(pulizie.creaAttivita).toHaveBeenCalledWith({
      camera_id: 4,
      tipo: 'riassetto',
      priorita: 'normale',
      assegnata_a: 3,
      data_prevista: '2030-06-01',
      note: null,
    });
    expect(creata).toHaveBeenCalledWith({ id: 9 });
  });

  it('senza camera non chiama il backend', async () => {
    const { elemento } = await crea();

    elemento.querySelector('form')!.dispatchEvent(new Event('submit'));

    expect(pulizie.creaAttivita).not.toHaveBeenCalled();
  });

  it('mostra il motivo del rifiuto', async () => {
    pulizie.creaAttivita.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 422, error: {} })),
    );
    const { fixture, elemento, camera } = await crea();

    scegli(camera, 0);
    elemento.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(elemento.querySelector('[role=alert]')).not.toBeNull();
  });
});
