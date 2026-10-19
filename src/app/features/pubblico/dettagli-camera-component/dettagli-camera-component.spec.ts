import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { CameraInterface } from '../../../shared/models/camera/camera-model';
import { TipologiaCameraInterface } from '../../../shared/models/tipologia-camera/tipologia-camera-model';
import { DettagliCameraComponent } from './dettagli-camera-component';

describe('DettagliCameraComponent', () => {
  const tipologia = {
    descrizione: 'Vista sul golfo.',
    ospiti_max: 3,
    superficie_mq: null,
    letti: '1 matrimoniale',
    servizi: [{ id: 5, nome: 'Wi-Fi', icona: 'wifi' }],
  } as unknown as TipologiaCameraInterface;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [traduzioniTest()] });
  });

  async function crea(camera?: CameraInterface) {
    const fixture = TestBed.createComponent(DettagliCameraComponent);
    fixture.componentRef.setInput('tipologia', tipologia);
    fixture.componentRef.setInput('camera', camera);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('della tipologia mostra descrizione, ospiti, letti e dotazioni', async () => {
    const elemento = await crea();

    expect(elemento.querySelector('.descrizione')?.textContent).toBe('Vista sul golfo.');
    expect(elemento.querySelectorAll('.dettagli dd')).toHaveLength(2);
    expect(elemento.querySelector('#dotazioni')).not.toBeNull();
    expect(elemento.querySelector('.dotazioni li')?.textContent).toContain('Wi-Fi');
  });

  it('della camera aggiunge il piano e tiene le dotazioni della tipologia', async () => {
    const elemento = await crea({ piano: 2, ospiti_max: 2, descrizione: null } as CameraInterface);

    const valori = [...elemento.querySelectorAll('.dettagli dd')].map((voce) => voce.textContent);
    expect(valori).toHaveLength(3);
    expect(valori[1]).toBe('2');
    const dotazioni = [...elemento.querySelectorAll('.dotazioni li')].map(
      (voce) => voce.textContent,
    );
    expect(dotazioni).toHaveLength(1);
    expect(dotazioni[0]).toContain('Wi-Fi');
    expect(elemento.querySelector('.descrizione')?.textContent).toBe('Vista sul golfo.');
  });

  it('la descrizione della camera prende il posto di quella della tipologia', async () => {
    const elemento = await crea({ piano: 1, descrizione: 'Angolo lettura.' } as CameraInterface);

    expect(elemento.querySelector('.descrizione')?.textContent).toBe('Angolo lettura.');
  });
});
