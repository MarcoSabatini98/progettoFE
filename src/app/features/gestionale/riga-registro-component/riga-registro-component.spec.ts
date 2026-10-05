import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { RegistroAttivitaInterface } from '../../../shared/models/registro-attivita/registro-attivita-model';
import { RigaRegistroComponent, campiToccati } from './riga-registro-component';

describe('RigaRegistroComponent', () => {
  const modifica: RegistroAttivitaInterface = {
    id: 1,
    tabella: 'prenotazioni',
    record_id: 7,
    azione: 'modifica',
    dati_prima: { stato: 'in_attesa', adulti: 2, totale: 200 },
    dati_dopo: { stato: 'confermata', adulti: 2, totale: null, codice: 'BB-7' },
    utente_id: 3,
    ip: null,
    creato_il: '2030-06-01T10:00:00Z',
    utente: { id: 3, nome: 'Anna', cognome: 'Rossi' } as RegistroAttivitaInterface['utente'],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [provideRouter([]), { provide: LinguaService, useValue: { attiva: () => 'it' } }],
    });
  });

  async function crea(voce: RegistroAttivitaInterface, collegato = true) {
    const fixture = TestBed.createComponent(RigaRegistroComponent);
    fixture.componentRef.setInput('voce', voce);
    fixture.componentRef.setInput('collegato', collegato);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('mostra chi ha cambiato cosa, col link al record', async () => {
    const elemento = await crea(modifica);

    expect(elemento.textContent).toContain('gestionale.registro.azioni.modifica');
    expect(elemento.textContent).toContain('Rossi Anna');
    expect(elemento.textContent).toContain('in_attesa → confermata');
    expect(elemento.textContent).not.toContain('gestionale.registro.campi.adulti');
    expect(elemento.querySelector('a[href="/staff/prenotazioni/7"]')).not.toBeNull();
  });

  it('senza utente è stato il sistema; nella storia niente link', async () => {
    const elemento = await crea({ ...modifica, utente: null }, false);

    expect(elemento.textContent).toContain('gestionale.registro.sistema');
    expect(elemento.querySelector('a')).toBeNull();
  });

  it('un pagamento porta alla sua prenotazione, se si conosce', async () => {
    const pagamento = {
      ...modifica,
      tabella: 'pagamenti',
      record_id: 4,
      azione: 'inserimento',
      dati_prima: null,
      dati_dopo: { prenotazione_id: 7, importo: 50 },
    } as const;

    expect((await crea(pagamento)).querySelector('a[href="/staff/prenotazioni/7"]')).not.toBeNull();
    expect(
      (await crea({ ...pagamento, dati_dopo: { importo: 50 } })).querySelector('a'),
    ).toBeNull();
  });
});

describe('campiToccati', () => {
  const base = {
    id: 1,
    tabella: 'fatture',
    record_id: 9,
    utente_id: null,
    ip: null,
    creato_il: '2030-06-01T10:00:00Z',
  } as const;

  it('nella modifica solo i campi cambiati, il vuoto come trattino', () => {
    expect(
      campiToccati({
        ...base,
        azione: 'modifica',
        dati_prima: { stato_sdi: 'bozza', numero: null, totale: 10 },
        dati_dopo: { stato_sdi: 'da_inviare', numero: 12, totale: 10 },
      }),
    ).toEqual([
      { campo: 'stato_sdi', prima: 'bozza', dopo: 'da_inviare' },
      { campo: 'numero', prima: '—', dopo: '12' },
    ]);
  });

  it("nell'inserimento i dati nuovi, nell'eliminazione quelli persi", () => {
    expect(
      campiToccati({ ...base, azione: 'inserimento', dati_prima: null, dati_dopo: { numero: 1 } }),
    ).toEqual([{ campo: 'numero', dopo: '1' }]);
    expect(
      campiToccati({ ...base, azione: 'eliminazione', dati_prima: { numero: 1 }, dati_dopo: null }),
    ).toEqual([{ campo: 'numero', prima: '1' }]);
  });
});
