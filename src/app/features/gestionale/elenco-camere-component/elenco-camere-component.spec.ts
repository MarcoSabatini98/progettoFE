import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CamereService } from '../../../core/services/camere/camere-service';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { ElencoCamereComponent } from './elenco-camere-component';

describe('ElencoCamereComponent', () => {
  const camere = {
    elencaTipologie: vi.fn(),
    elencaCamere: vi.fn(),
    creaTipologia: vi.fn(),
    creaCamera: vi.fn(),
  };
  const singola = {
    id: 1,
    nome: 'Singola',
    prezzo_base: 60,
    ospiti_max: 1,
    attiva: false,
    media: [{ id: 3, percorso: 'media/s.jpg' }],
  };
  const camera = {
    id: 4,
    numero: '101',
    nome: null,
    piano: 1,
    stato: 'manutenzione',
    tipologia: { id: 1, nome: 'Singola' },
  };

  beforeEach(() => {
    Object.values(camere).forEach((spia) => spia.mockReset());
    camere.elencaTipologie.mockReturnValue(of([singola]));
    camere.elencaCamere.mockReturnValue(of([camera]));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: CamereService, useValue: camere },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(ElencoCamereComponent);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const invia = async (indice: number) => {
      elemento.querySelectorAll('form')[indice].dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    const scrivi = (selettore: string, valore: string) => {
      const campo = elemento.querySelector<HTMLInputElement | HTMLSelectElement>(selettore)!;
      campo.value = valore;
      campo.dispatchEvent(new Event(campo instanceof HTMLSelectElement ? 'change' : 'input'));
    };
    return { elemento, invia, scrivi };
  }

  it('elenca tipologie e camere con i link alle schede', async () => {
    const { elemento } = await crea();
    const [tipologia, stanza] = elemento.querySelectorAll<HTMLAnchorElement>('.elenco a');

    expect(tipologia.getAttribute('href')).toBe('/staff/camere/tipologie/1');
    expect(tipologia.textContent).toContain('gestionale.camere.nonSulSito');
    expect(tipologia.querySelector('img')).not.toBeNull();
    expect(stanza.getAttribute('href')).toBe('/staff/camere/4');
    expect(stanza.textContent).toContain('gestionale.camere.stati.manutenzione');
  });

  it('crea una tipologia e apre la sua scheda', async () => {
    camere.creaTipologia.mockReturnValue(of({ id: 9 }));
    const naviga = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const { invia, scrivi } = await crea();

    scrivi('[formControlName=nome]', 'Suite');
    scrivi('[formControlName=prezzo_base]', '150');
    await invia(0);

    expect(camere.creaTipologia).toHaveBeenCalledWith({
      nome: 'Suite',
      prezzo_base: 150,
      ospiti_max: 2,
    });
    expect(naviga).toHaveBeenCalledWith(['/staff/camere/tipologie', 9]);
  });

  it('crea una camera e mostra il motivo se il backend la rifiuta', async () => {
    camere.creaCamera.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 409, error: { messaggio: 'Doppione' } })),
    );
    const { elemento, invia, scrivi } = await crea();

    await invia(1);
    expect(camere.creaCamera).not.toHaveBeenCalled();

    scrivi('[formControlName=numero]', '102');
    scrivi('[formControlName=tipologia_id]', '0: 1');
    await invia(1);

    expect(camere.creaCamera).toHaveBeenCalledWith({ numero: '102', tipologia_id: 1 });
    expect(elemento.querySelectorAll('form')[1].querySelector('[role=alert]')).not.toBeNull();
  });
});
