import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AlloggiatiService } from '../../../core/services/alloggiati/alloggiati-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { OspitiService } from '../../../core/services/ospiti/ospiti-service';
import { SchedaOspiteComponent } from './scheda-ospite-component';

describe('SchedaOspiteComponent', () => {
  const ospiti = {
    leggiOspite: vi.fn(),
    eliminaOspite: vi.fn(),
    caricaDocumento: vi.fn(),
    aggiornaOspite: vi.fn(),
  };
  const anna = {
    id: 3,
    nome: 'Anna',
    cognome: 'Verdi',
    lingua: 'it',
    campi_mancanti: ['sesso', 'data_nascita'],
    documenti: [],
    soggiorni: [
      {
        id: 7,
        codice: 'BB-7',
        stato: 'confermata',
        data_arrivo: '2030-06-01',
        data_partenza: '2030-06-03',
      },
    ],
  };

  beforeEach(() => {
    Object.values(ospiti).forEach((spia) => spia.mockReset());
    ospiti.leggiOspite.mockReturnValue(of(anna));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: OspitiService, useValue: ospiti },
        { provide: AlloggiatiService, useValue: { cercaLuoghi: () => of([]) } },
        { provide: AvvisiService, useValue: { mostra: vi.fn() } },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(SchedaOspiteComponent);
    fixture.componentRef.setInput('id', '3');
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const clicca = async (testo: string) => {
      [...elemento.querySelectorAll<HTMLButtonElement>('button')]
        .find((pulsante) => pulsante.textContent?.includes(testo))!
        .click();
      await fixture.whenStable();
    };
    return { fixture, elemento, clicca };
  }

  it('mostra cosa manca alla schedina e i soggiorni collegati alla prenotazione', async () => {
    const { elemento } = await crea();

    expect(ospiti.leggiOspite).toHaveBeenCalledWith(3);
    expect(elemento.querySelector('h1')?.textContent).toContain('Verdi Anna');
    expect(elemento.querySelectorAll('.mancanti li')).toHaveLength(2);
    expect(elemento.querySelector('.soggiorni a')?.getAttribute('href')).toBe(
      '/staff/prenotazioni/7',
    );
    expect(elemento.querySelector('app-dati-ospite')).not.toBeNull();
  });

  it("i documenti si caricano sull'anagrafica e poi si rilegge la scheda", async () => {
    ospiti.caricaDocumento.mockReturnValue(of({ id: 1 }));
    const { fixture, elemento } = await crea();

    const campo = elemento.querySelector<HTMLInputElement>('input[type="file"]')!;
    const file = new File(['%PDF'], 'carta.pdf', { type: 'application/pdf' });
    Object.defineProperty(campo, 'files', { value: [file] });
    campo.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(ospiti.caricaDocumento).toHaveBeenCalledWith(3, file);
    expect(ospiti.leggiOspite).toHaveBeenCalledTimes(2);
  });

  it("elimina dopo la conferma e torna all'elenco", async () => {
    ospiti.eliminaOspite.mockReturnValue(of(null));
    const naviga = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const { clicca } = await crea();

    await clicca('gestionale.ospite.elimina');
    await clicca('gestionale.ospite.conferma');

    expect(ospiti.eliminaOspite).toHaveBeenCalledWith(3);
    expect(naviga).toHaveBeenCalledWith('/staff/ospiti');
  });

  it('chi ha soggiornato non si elimina: lo spiega', async () => {
    ospiti.eliminaOspite.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { errore: { codice: 'OSPITE_CON_SOGGIORNI', messaggio: 'Ha soggiornato' } },
          }),
      ),
    );
    const { elemento, clicca } = await crea();

    await clicca('gestionale.ospite.elimina');
    await clicca('gestionale.ospite.conferma');

    expect(elemento.querySelector('[role=alert]')?.textContent).toContain('Ha soggiornato');
    expect(elemento.querySelector('.pulsante-pericolo')).toBeNull();
  });
});
