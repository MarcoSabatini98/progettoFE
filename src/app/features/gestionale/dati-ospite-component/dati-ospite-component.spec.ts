import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AlloggiatiService } from '../../../core/services/alloggiati/alloggiati-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { OspitiService } from '../../../core/services/ospiti/ospiti-service';
import { CODICE_ITALIA } from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { SchedaOspiteInterface } from '../../../shared/models/ospite/ospite-model';
import { DatiOspiteComponent } from './dati-ospite-component';

describe('DatiOspiteComponent', () => {
  const ospiti = { aggiornaOspite: vi.fn() };
  const alloggiati = { cercaLuoghi: vi.fn() };
  const avvisi = { mostra: vi.fn() };
  const anna = {
    id: 3,
    nome: 'Anna',
    cognome: 'Verdi',
    email: null,
    citta: 'Roma',
    lingua: 'it',
    stato_nascita_codice: CODICE_ITALIA,
    stato_nascita: { codice: CODICE_ITALIA, descrizione: 'ITALIA' },
    comune_nascita: { codice: '412058091', descrizione: 'ROMA' },
    campi_mancanti: [],
  } as unknown as SchedaOspiteInterface;

  beforeEach(() => {
    [ospiti.aggiornaOspite, alloggiati.cercaLuoghi, avvisi.mostra].forEach((spia) =>
      spia.mockReset(),
    );
    alloggiati.cercaLuoghi.mockReturnValue(of([]));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: OspitiService, useValue: ospiti },
        { provide: AlloggiatiService, useValue: alloggiati },
        { provide: AvvisiService, useValue: avvisi },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(DatiOspiteComponent);
    fixture.componentRef.setInput('ospite', anna);
    const salvati: SchedaOspiteInterface[] = [];
    fixture.componentInstance.salvato.subscribe((ospite) => salvati.push(ospite));
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const scrivi = async (selettore: string, valore: string) => {
      const campo = elemento.querySelector<HTMLInputElement>(selettore)!;
      campo.value = valore;
      campo.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    };
    const invia = async () => {
      elemento.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { elemento, salvati, scrivi, invia };
  }

  it('parte dai dati registrati, coi luoghi per nome e il comune per chi è nato in Italia', async () => {
    const { elemento } = await crea();

    const luoghi = [...elemento.querySelectorAll<HTMLInputElement>('app-cerca-luogo input')];
    expect(elemento.querySelector<HTMLInputElement>('[formControlName=nome]')!.value).toBe('Anna');
    expect(luoghi.map((campo) => campo.value)).toContain('ROMA');
    expect(luoghi).toHaveLength(4);
  });

  it('salva i soli campi cambiati, uno svuotato come null', async () => {
    ospiti.aggiornaOspite.mockReturnValue(of({ ...anna, telefono: '333' }));
    const { salvati, scrivi, invia } = await crea();

    await scrivi('[formControlName=telefono]', '333');
    await scrivi('[formControlName=cognome]', 'Rossi');
    await scrivi('[formControlName=citta]', '');
    await invia();

    expect(ospiti.aggiornaOspite).toHaveBeenCalledWith(3, {
      telefono: '333',
      cognome: 'Rossi',
      citta: null,
    });
    expect(avvisi.mostra).toHaveBeenCalledWith('gestionale.anagrafica.salvata', 'successo');
    expect(salvati).toHaveLength(1);
  });

  it('senza nome non salva', async () => {
    const { scrivi, invia } = await crea();

    await scrivi('[formControlName=nome]', '');
    await invia();

    expect(ospiti.aggiornaOspite).not.toHaveBeenCalled();
  });

  it("l'anagrafica di un cliente registrato la cambia solo lui: lo spiega", async () => {
    ospiti.aggiornaOspite.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 403,
            error: { errore: { codice: 'DATI_CLIENTE_PROTETTI', messaggio: 'Protetti' } },
          }),
      ),
    );
    const { elemento, salvati, scrivi, invia } = await crea();

    await scrivi('[formControlName=telefono]', '333');
    await invia();

    expect(elemento.querySelector('[role=alert]')?.textContent).toContain('Protetti');
    expect(salvati).toHaveLength(0);
  });
});
