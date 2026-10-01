import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { CamereService } from '../../../core/services/camere/camere-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { DatiCameraComponent } from './dati-camera-component';

describe('DatiCameraComponent', () => {
  const camere = { aggiornaCamera: vi.fn(), elencaServizi: vi.fn() };
  const camera = {
    id: 4,
    numero: '101',
    nome: null,
    tipologia_id: 2,
    piano: 1,
    ospiti_max: null,
    stato: 'attiva',
    note: null,
    servizi: [],
  };
  const tipologie = [
    { id: 1, nome: 'Singola' },
    { id: 2, nome: 'Doppia' },
  ];

  beforeEach(() => {
    Object.values(camere).forEach((spia) => spia.mockReset());
    camere.elencaServizi.mockReturnValue(of([]));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: CamereService, useValue: camere },
        { provide: AvvisiService, useValue: { mostra: vi.fn() } },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(DatiCameraComponent);
    fixture.componentRef.setInput('camera', camera);
    fixture.componentRef.setInput('tipologie', tipologie);
    const salvata = vi.fn();
    fixture.componentInstance.salvata.subscribe(salvata);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const campo = (nome: string) =>
      elemento.querySelector<HTMLInputElement | HTMLSelectElement>(`[formControlName="${nome}"]`)!;
    const salva = async () => {
      elemento.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { campo, salva, salvata };
  }

  it('propone le tipologie con quella della camera scelta', async () => {
    const { campo } = await crea();
    const tipologia = campo('tipologia_id') as HTMLSelectElement;

    expect(tipologia.options).toHaveLength(2);
    expect(tipologia.selectedOptions[0].textContent).toContain('Doppia');
    expect(campo('numero').value).toBe('101');
  });

  it('cambia stato e tipologia mandando i soli campi toccati', async () => {
    camere.aggiornaCamera.mockReturnValue(of({ ...camera, stato: 'manutenzione' }));
    const { campo, salva, salvata } = await crea();

    campo('stato').value = 'manutenzione';
    campo('stato').dispatchEvent(new Event('change'));
    (campo('tipologia_id') as HTMLSelectElement).selectedIndex = 0;
    campo('tipologia_id').dispatchEvent(new Event('change'));
    await salva();

    expect(camere.aggiornaCamera).toHaveBeenCalledWith(4, {
      tipologia_id: 1,
      stato: 'manutenzione',
    });
    expect(salvata).toHaveBeenCalled();
  });

  it('senza numero non salva', async () => {
    const { campo, salva } = await crea();

    campo('numero').value = '';
    campo('numero').dispatchEvent(new Event('input'));
    await salva();

    expect(camere.aggiornaCamera).not.toHaveBeenCalled();
  });
});
