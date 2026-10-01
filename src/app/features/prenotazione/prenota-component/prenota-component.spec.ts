import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { CamereService } from '../../../core/services/camere/camere-service';
import { DisponibilitaService } from '../../../core/services/disponibilita/disponibilita-service';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { TariffeService } from '../../../core/services/tariffe/tariffe-service';
import { DisponibilitaInterface } from '../../../shared/models/disponibilita/disponibilita-model';
import { PreventivoInterface } from '../../../shared/models/preventivo/preventivo-model';
import { TipologiaCameraInterface } from '../../../shared/models/tipologia-camera/tipologia-camera-model';
import { ConfermaPrenotazioneComponent } from '../conferma-prenotazione-component/conferma-prenotazione-component';
import { RicercaSoggiornoComponent } from '../ricerca-soggiorno-component/ricerca-soggiorno-component';
import { PrenotaComponent } from './prenota-component';

describe('PrenotaComponent', () => {
  const disponibilita = { cerca: vi.fn(), blocca: vi.fn(), rilascia: vi.fn() };
  const filtri = {
    arrivo: '2030-07-01',
    partenza: '2030-07-04',
    adulti: 2,
    bambini: 1,
    eta_bambini: [6],
  };
  const doppia = {
    id: 1,
    nome: 'Doppia',
    ospiti_max: 3,
    media: [],
  } as unknown as TipologiaCameraInterface;
  const preventivo = {
    totale: 300,
    acconto_richiesto: 90,
    numero_notti: 3,
    piano: null,
  } as unknown as PreventivoInterface;
  const risultati: DisponibilitaInterface[] = [
    { tipologia: doppia, camere_libere: 2, preventivo, non_prenotabile: null },
    {
      tipologia: { ...doppia, id: 2, nome: 'Suite' },
      camere_libere: 1,
      preventivo: null,
      non_prenotabile: { codice: 'SOGGIORNO_MINIMO', messaggio: 'Almeno 5 notti' },
    },
  ];
  const blocco = { sessione: 'abc', camera_id: 7, scade_il: '2030-06-30T10:15:00' };

  beforeEach(() => {
    Object.values(disponibilita).forEach((spia) => spia.mockReset());
    disponibilita.cerca.mockReturnValue(of(risultati));
    disponibilita.rilascia.mockReturnValue(of(null));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: DisponibilitaService, useValue: disponibilita },
        { provide: TariffeService, useValue: { elencaPacchettiPubblici: () => of([]) } },
        { provide: CamereService, useValue: { elencaExtraPubblici: () => of([]) } },
        { provide: AuthService, useValue: { haRuolo: () => false, utente: () => null } },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  async function crea(staff = false) {
    const fixture = TestBed.createComponent(PrenotaComponent);
    fixture.componentRef.setInput('staff', staff);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const cerca = async () => {
      fixture.debugElement
        .query(By.directive(RicercaSoggiornoComponent))
        .componentInstance.cerca.emit(filtri);
      await fixture.whenStable();
    };
    const scegli = async () => {
      elemento.querySelector<HTMLButtonElement>('.risultato button')?.click();
      await fixture.whenStable();
    };
    const conferma = () => fixture.debugElement.query(By.directive(ConfermaPrenotazioneComponent));
    return { fixture, elemento, cerca, scegli, conferma };
  }

  it('mostra le tipologie libere col prezzo o il motivo per cui non si prenotano', async () => {
    const { elemento, cerca } = await crea();

    await cerca();

    expect(disponibilita.cerca).toHaveBeenCalledWith({ ...filtri, sessione: undefined });
    const schede = elemento.querySelectorAll('.risultato');
    expect(schede).toHaveLength(2);
    expect(schede[0].querySelector('button')).not.toBeNull();
    expect(schede[1].querySelector('button')).toBeNull();
    expect(schede[1].textContent).toContain('Almeno 5 notti');
  });

  it('scegliere blocca una camera per tutti gli ospiti e apre la conferma', async () => {
    disponibilita.blocca.mockReturnValue(of(blocco));
    const { cerca, scegli, conferma } = await crea();
    await cerca();

    await scegli();

    expect(disponibilita.blocca).toHaveBeenCalledWith({
      sessione: undefined,
      tipologia_id: 1,
      arrivo: '2030-07-01',
      partenza: '2030-07-04',
      ospiti: 3,
    });
    expect(conferma().componentInstance.scelta()).toEqual({
      tipologia: doppia,
      preventivo,
      filtri,
      blocco,
    });
  });

  it('cambiando camera ricerca tenendo il blocco, che si libera lasciando la pagina', async () => {
    disponibilita.blocca.mockReturnValue(of(blocco));
    const { fixture, elemento, cerca, scegli, conferma } = await crea();
    await cerca();
    await scegli();

    conferma().componentInstance.cambiaCamera.emit();
    await fixture.whenStable();

    expect(disponibilita.cerca).toHaveBeenLastCalledWith({ ...filtri, sessione: 'abc' });
    expect(elemento.querySelectorAll('.risultato')).toHaveLength(2);

    await scegli();
    expect(disponibilita.blocca).toHaveBeenLastCalledWith(
      expect.objectContaining({ sessione: 'abc' }),
    );

    fixture.destroy();
    expect(disponibilita.rilascia).toHaveBeenCalledWith('abc');
  });

  it('se la camera non si blocca resta sui risultati e spiega perché', async () => {
    disponibilita.blocca.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { errore: { codice: 'CAMERA_NON_DISPONIBILE', messaggio: 'Appena prenotata' } },
          }),
      ),
    );
    const { elemento, cerca, scegli, conferma } = await crea();
    await cerca();

    await scegli();

    expect(conferma()).toBeNull();
    expect(elemento.querySelector('[role="alert"]')?.textContent).toContain('Appena prenotata');
  });

  it('dal gestionale cambia intestazione e passa la modalità staff alla conferma', async () => {
    disponibilita.blocca.mockReturnValue(of(blocco));
    const { elemento, cerca, scegli, conferma } = await crea(true);
    await cerca();

    await scegli();

    expect(elemento.querySelector('h1')?.textContent).toContain('gestionale.nuova.titolo');
    expect(conferma().componentInstance.staff()).toBe(true);
  });
});
