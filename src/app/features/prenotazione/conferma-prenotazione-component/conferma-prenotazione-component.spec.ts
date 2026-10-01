import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { CamereService } from '../../../core/services/camere/camere-service';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { PrenotazioniService } from '../../../core/services/prenotazioni/prenotazioni-service';
import { TariffeService } from '../../../core/services/tariffe/tariffe-service';
import { PacchettoInterface } from '../../../shared/models/pacchetto/pacchetto-model';
import { PreventivoInterface } from '../../../shared/models/preventivo/preventivo-model';
import { SceltaSoggiornoInterface } from '../../../shared/models/scelta-soggiorno/scelta-soggiorno-model';
import { ServizioInterface } from '../../../shared/models/servizio/servizio-model';
import { TipologiaCameraInterface } from '../../../shared/models/tipologia-camera/tipologia-camera-model';
import { ConfermaPrenotazioneComponent } from './conferma-prenotazione-component';

describe('ConfermaPrenotazioneComponent', () => {
  const tariffe = {
    elencaPacchettiPubblici: vi.fn(),
    verificaCodiceSconto: vi.fn(),
    calcolaPreventivo: vi.fn(),
  };
  const prenotazioni = { creaPrenotazione: vi.fn() };
  const auth = { haRuolo: vi.fn(), utente: vi.fn() };
  const preventivo = {
    importo_soggiorno: 300,
    totale: 300,
    acconto_richiesto: 0,
    numero_notti: 3,
    piano: { rimborsabile: true, ore_cancellazione_gratuita: 48 },
  } as unknown as PreventivoInterface;
  const scelta: SceltaSoggiornoInterface = {
    tipologia: { id: 1, nome: 'Doppia' } as TipologiaCameraInterface,
    preventivo,
    filtri: {
      arrivo: '2030-07-01',
      partenza: '2030-07-04',
      adulti: 2,
      bambini: 0,
      eta_bambini: [],
    },
    blocco: { sessione: 'abc', camera_id: 7, scade_il: '2030-06-30T10:15:00' },
  };
  const pacchetti = [
    { id: 1, nome: 'Per tutti', prezzo: 50, tipologia_id: null, notti_min: null },
    { id: 2, nome: 'Solo suite', prezzo: 80, tipologia_id: 2, notti_min: null },
    { id: 3, nome: 'Settimana', prezzo: 90, tipologia_id: 1, notti_min: 7 },
  ] as PacchettoInterface[];
  const colazione = {
    id: 4,
    nome: 'Colazione',
    prezzo: 10,
    calcolo_prezzo: 'a_persona_notte',
  } as ServizioInterface;

  beforeEach(() => {
    [...Object.values(tariffe), ...Object.values(auth), prenotazioni.creaPrenotazione].forEach(
      (spia) => spia.mockReset(),
    );
    tariffe.elencaPacchettiPubblici.mockReturnValue(of(pacchetti));
    tariffe.calcolaPreventivo.mockReturnValue(of({ ...preventivo, totale: 270 }));
    auth.haRuolo.mockReturnValue(false);
    auth.utente.mockReturnValue(null);
    TestBed.configureTestingModule({
      imports: [traduzioniTest({ conferma: { rimborsabile: 'Gratis fino a {{ ore }} ore' } })],
      providers: [
        provideRouter([]),
        { provide: TariffeService, useValue: tariffe },
        { provide: CamereService, useValue: { elencaExtraPubblici: () => of([colazione]) } },
        { provide: PrenotazioniService, useValue: prenotazioni },
        { provide: AuthService, useValue: auth },
        { provide: LinguaService, useValue: { attiva: () => 'en' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  async function crea(staff = false) {
    const fixture = TestBed.createComponent(ConfermaPrenotazioneComponent);
    fixture.componentRef.setInput('scelta', scelta);
    fixture.componentRef.setInput('staff', staff);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const scrivi = async (nome: string, valore: string) => {
      const campo = elemento.querySelector<HTMLInputElement>(`[formControlName="${nome}"]`);
      campo!.value = valore;
      campo!.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    };
    const clicca = async (selettore: string) => {
      elemento.querySelector<HTMLElement>(selettore)?.click();
      await fixture.whenStable();
    };
    const invia = async () => {
      elemento.querySelector('form')?.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    const totale = () => elemento.querySelector('.totale dd')?.textContent?.replace(/\s/g, ' ');
    return { elemento, scrivi, clicca, invia, totale };
  }

  it('mostra solo i pacchetti adatti a tipologia e notti, e la politica del piano', async () => {
    const { elemento } = await crea();

    const opzioni = [...elemento.querySelectorAll('select option')].map((opzione) =>
      opzione.textContent?.trim(),
    );
    expect(opzioni).toHaveLength(2);
    expect(opzioni[1]).toContain('Per tutti');
    expect(elemento.querySelector('.politica')?.textContent).toContain('Gratis fino a 48 ore');
  });

  it('un visitatore indica il titolare e poi apre la prenotazione creata', async () => {
    prenotazioni.creaPrenotazione.mockReturnValue(of({ codice: 'BB-123' }));
    const naviga = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const { scrivi, invia } = await crea();

    await invia();
    expect(prenotazioni.creaPrenotazione).not.toHaveBeenCalled();

    await scrivi('nome', 'Anna');
    await scrivi('cognome', 'Rossi');
    await scrivi('email', 'anna@esempio.it');
    await scrivi('richieste_speciali', 'Culla');
    await invia();

    expect(prenotazioni.creaPrenotazione).toHaveBeenCalledWith({
      arrivo: '2030-07-01',
      partenza: '2030-07-04',
      adulti: 2,
      bambini: 0,
      eta_bambini: [],
      codice_sconto: undefined,
      pacchetto_id: undefined,
      servizi: [],
      sessione: 'abc',
      titolare: {
        nome: 'Anna',
        cognome: 'Rossi',
        email: 'anna@esempio.it',
        telefono: '',
        lingua: 'en',
      },
      richieste_speciali: 'Culla',
      ora_arrivo_prevista: null,
    });
    expect(naviga).toHaveBeenCalledWith(['/prenotazioni', 'BB-123'], {
      state: { email: 'anna@esempio.it' },
    });
  });

  it('il cliente collegato prenota a suo nome', async () => {
    auth.haRuolo.mockReturnValue(true);
    auth.utente.mockReturnValue({ email: 'cliente@esempio.it' });
    prenotazioni.creaPrenotazione.mockReturnValue(of({ codice: 'BB-9' }));
    const naviga = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const { elemento, invia } = await crea();

    expect(elemento.querySelector('[formControlName="nome"]')).toBeNull();
    await invia();

    expect(prenotazioni.creaPrenotazione).toHaveBeenCalledWith(
      expect.objectContaining({ titolare: undefined }),
    );
    expect(naviga).toHaveBeenCalledWith(['/prenotazioni', 'BB-9'], {
      state: { email: 'cliente@esempio.it' },
    });
  });

  it('lo staff prenota senza email, con canale e note, e apre la scheda', async () => {
    prenotazioni.creaPrenotazione.mockReturnValue(of({ id: 42, codice: 'BB-42' }));
    const naviga = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const { elemento, scrivi, invia } = await crea(true);
    const stato = elemento.querySelector<HTMLSelectElement>('[formControlName="stato"]')!;

    await scrivi('nome', 'Anna');
    await scrivi('cognome', 'Rossi');
    await scrivi('id_esterno', 'BK-1');
    await scrivi('note_interne', 'Cliente abituale');
    stato.selectedIndex = 1;
    stato.dispatchEvent(new Event('change'));
    await invia();

    expect(prenotazioni.creaPrenotazione).toHaveBeenCalledWith(
      expect.objectContaining({
        titolare: { nome: 'Anna', cognome: 'Rossi', email: '', telefono: '', lingua: 'en' },
        canale: 'telefono',
        stato: 'in_attesa',
        id_esterno: 'BK-1',
        note_interne: 'Cliente abituale',
      }),
    );
    expect(naviga).toHaveBeenCalledWith(['/staff/prenotazioni', 42]);
  });

  it('online i campi dello staff non ci sono', async () => {
    prenotazioni.creaPrenotazione.mockReturnValue(of({ codice: 'BB-9' }));
    auth.haRuolo.mockReturnValue(true);
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const { elemento, invia } = await crea();

    expect(elemento.querySelector('[formControlName="canale"]')).toBeNull();
    await invia();

    expect(prenotazioni.creaPrenotazione.mock.calls[0][0]).not.toHaveProperty('canale');
  });

  it('un codice valido e gli extra ricalcolano il conto', async () => {
    tariffe.verificaCodiceSconto.mockReturnValue(
      of({ codice: 'ESTATE10', tipo_sconto: 'percentuale', valore: 10, descrizione: null }),
    );
    const { elemento, scrivi, clicca, totale } = await crea();
    expect(totale()).toBe('€300.00');

    await scrivi('codice_sconto', 'estate10');
    await clicca('.codice button');
    await clicca('.casella input');

    expect(tariffe.verificaCodiceSconto).toHaveBeenCalledWith('estate10');
    expect(tariffe.calcolaPreventivo).toHaveBeenLastCalledWith(
      expect.objectContaining({
        tipologia_id: 1,
        codice_sconto: 'ESTATE10',
        servizi: [{ servizio_id: 4 }],
      }),
    );
    expect(totale()).toBe('€270.00');
    expect(elemento.querySelector('.codice-applicato')?.textContent).toContain(
      'conferma.codicePercentuale',
    );
  });

  it('un codice inesistente resta da correggere, col motivo', async () => {
    tariffe.verificaCodiceSconto.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            error: { errore: { codice: 'CODICE_SCONTO_NON_TROVATO', messaggio: 'Non esiste' } },
          }),
      ),
    );
    const { elemento, scrivi, clicca } = await crea();

    await scrivi('codice_sconto', 'NOPE');
    await clicca('.codice button');

    expect(tariffe.calcolaPreventivo).not.toHaveBeenCalled();
    expect(elemento.querySelector('.codice')?.textContent).toContain('Non esiste');
  });
});
