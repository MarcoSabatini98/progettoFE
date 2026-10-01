import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { OspitiService } from '../../../core/services/ospiti/ospiti-service';
import { OspitiSoggiornoComponent } from './ospiti-soggiorno-component';

describe('OspitiSoggiornoComponent', () => {
  const ospiti = {
    elencaOspitiPrenotazione: vi.fn(),
    impostaOspitiPrenotazione: vi.fn(),
    elencaOspiti: vi.fn(),
  };
  const avvisi = { mostra: vi.fn() };
  const anna = {
    id: 3,
    nome: 'Anna',
    cognome: 'Verdi',
    email: 'anna@example.com',
    tipo_alloggiato: 'ospite_singolo',
    esente_tassa: false,
    motivo_esenzione: null,
    campi_mancanti: ['sesso'],
  };
  const prenotazione = { id: 7, stato: 'confermata', adulti: 2, bambini: 1 };

  beforeEach(() => {
    vi.useFakeTimers();
    Object.values(ospiti).forEach((spia) => spia.mockReset());
    avvisi.mostra.mockReset();
    ospiti.elencaOspitiPrenotazione.mockReturnValue(of([anna]));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: OspitiService, useValue: ospiti },
        { provide: AvvisiService, useValue: avvisi },
      ],
    });
  });

  afterEach(() => vi.useRealTimers());

  // Coi timer finti lo scheduler di Angular aspetta il debounce: si fa scorrere il tempo.
  async function attendi(fixture: ComponentFixture<OspitiSoggiornoComponent>) {
    await vi.runAllTimersAsync();
    await fixture.whenStable();
  }

  async function crea(dati: object = prenotazione) {
    const fixture = TestBed.createComponent(OspitiSoggiornoComponent);
    fixture.componentRef.setInput('prenotazione', dati);
    const aggiornati = vi.fn();
    fixture.componentInstance.aggiornati.subscribe(aggiornati);
    await attendi(fixture);
    const elemento: HTMLElement = fixture.nativeElement;
    const scrivi = async (selettore: string, valore: string) => {
      const campo = elemento.querySelector<HTMLInputElement>(selettore)!;
      campo.value = valore;
      campo.dispatchEvent(new Event('input'));
      await attendi(fixture);
    };
    const clicca = async (selettore: string) => {
      elemento.querySelector<HTMLButtonElement>(selettore)!.click();
      await attendi(fixture);
    };
    const salva = () => clicca('.azioni .pulsante-primario');
    return { fixture, elemento, aggiornati, scrivi, clicca, salva };
  }

  it('mostra gli ospiti col ruolo e cosa manca; salvare serve solo dopo un cambio', async () => {
    const { elemento } = await crea();

    expect(ospiti.elencaOspitiPrenotazione).toHaveBeenCalledWith(7);
    expect(elemento.querySelector('.chi a')?.getAttribute('href')).toBe('/staff/ospiti/3');
    expect(elemento.querySelector('.chi')?.textContent).toContain(
      'gestionale.ospitiSoggiorno.mancano',
    );
    expect(elemento.querySelector<HTMLSelectElement>('select')!.value).toBe('ospite_singolo');
    expect(elemento.querySelector<HTMLButtonElement>('.azioni .pulsante-primario')!.disabled).toBe(
      true,
    );
  });

  it("aggiunge un'anagrafica trovata e una nuova, poi salva la lista intera", async () => {
    ospiti.elencaOspiti.mockReturnValue(
      of({ elementi: [{ id: 5, nome: 'Marco', cognome: 'Bianchi' }], totale: 1 }),
    );
    ospiti.impostaOspitiPrenotazione.mockReturnValue(of([anna]));
    const { elemento, aggiornati, scrivi, clicca, salva } = await crea();

    await scrivi('input[type=search]', 'bia');
    expect(ospiti.elencaOspiti).toHaveBeenCalledWith({ cerca: 'bia', perPagina: 5 });
    await clicca('.trovati button');
    await scrivi('[formControlName=nome]', 'Luca');
    await scrivi('[formControlName=cognome]', 'Neri');
    elemento.querySelector('form.nuovo')!.dispatchEvent(new Event('submit'));
    await salva();

    expect(ospiti.impostaOspitiPrenotazione).toHaveBeenCalledWith(7, [
      {
        ospite: { id: 3 },
        tipo_alloggiato: 'capofamiglia',
        esente_tassa: false,
        motivo_esenzione: null,
      },
      {
        ospite: { id: 5 },
        tipo_alloggiato: 'familiare',
        esente_tassa: false,
        motivo_esenzione: null,
      },
      {
        ospite: { nome: 'Luca', cognome: 'Neri' },
        tipo_alloggiato: 'familiare',
        esente_tassa: false,
        motivo_esenzione: null,
      },
    ]);
    expect(avvisi.mostra).toHaveBeenCalledWith('gestionale.ospitiSoggiorno.salvati', 'successo');
    expect(aggiornati).toHaveBeenCalledOnce();
  });

  it("segna l'esenzione col motivo e toglie un ospite", async () => {
    ospiti.elencaOspitiPrenotazione.mockReturnValue(
      of([anna, { ...anna, id: 4, nome: 'Bea', tipo_alloggiato: 'familiare' }]),
    );
    ospiti.impostaOspitiPrenotazione.mockReturnValue(of([anna]));
    const { elemento, fixture, scrivi, clicca, salva } = await crea();

    const esente = elemento.querySelector<HTMLInputElement>('input[type=checkbox]')!;
    esente.click();
    await attendi(fixture);
    await scrivi('[formControlName=motivo_esenzione]', 'Minore');
    await clicca('.riga:last-child .togli');
    await salva();

    expect(ospiti.impostaOspitiPrenotazione).toHaveBeenCalledWith(7, [
      {
        ospite: { id: 3 },
        tipo_alloggiato: 'ospite_singolo',
        esente_tassa: true,
        motivo_esenzione: 'Minore',
      },
    ]);
  });

  it('a prenotazione piena non propone di aggiungere; se è chiusa non si cambia', async () => {
    const piena = await crea({ ...prenotazione, adulti: 1, bambini: 0 });
    expect(piena.elemento.querySelector('input[type=search]')).toBeNull();

    const chiusa = await crea({ ...prenotazione, stato: 'cancellata' });
    expect(chiusa.elemento.querySelector<HTMLSelectElement>('select')!.disabled).toBe(true);
    expect(chiusa.elemento.querySelector('.azioni')).toBeNull();
  });

  it('se il backend rifiuta la lista lo spiega', async () => {
    ospiti.impostaOspitiPrenotazione.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { errore: { codice: 'TROPPI_OSPITI', messaggio: 'Troppi ospiti' } },
          }),
      ),
    );
    const { elemento, clicca, salva } = await crea();

    await clicca('.togli');
    await salva();

    expect(elemento.querySelector('[role=alert]')?.textContent).toContain('Troppi ospiti');
  });
});
