import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { ChatService } from '../../../core/services/chat/chat-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { ConversazioneInterface } from '../../../shared/models/conversazione/conversazione-model';
import { AzioniConversazioneComponent } from './azioni-conversazione-component';

describe('AzioniConversazioneComponent', () => {
  const UUID = '6f1c2b1e-0000-4000-8000-000000000041';
  const chat = {
    assegna: vi.fn(),
    impostaStato: vi.fn(),
    rinominaGruppo: vi.fn(),
    aggiungiPartecipante: vi.fn(),
    esci: vi.fn(),
    esportaPdf: vi.fn(),
    elencaColleghi: vi.fn(),
  };
  const avvisi = { mostra: vi.fn() };

  beforeEach(() => {
    Object.values(chat).forEach((spia) => spia.mockReset());
    chat.elencaColleghi.mockReturnValue(
      of([
        { id: 1, nome: 'Marco', cognome: 'Rossi' },
        { id: 3, nome: 'Luca', cognome: 'Verdi' },
      ]),
    );
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: ChatService, useValue: chat },
        { provide: AvvisiService, useValue: avvisi },
        { provide: AuthService, useValue: { utente: () => ({ id: 1 }) } },
      ],
    });
  });

  async function crea(dati: Partial<ConversazioneInterface>) {
    const fixture = TestBed.createComponent(AzioniConversazioneComponent);
    fixture.componentRef.setInput('conversazione', { uuid: UUID, stato: 'aperta', ...dati });
    await fixture.whenStable();
    const elemento = fixture.nativeElement as HTMLElement;
    const premi = async (chiave: string) => {
      Array.from(elemento.querySelectorAll('button'))
        .find((b) => b.textContent?.includes(chiave))!
        .click();
      await fixture.whenStable();
    };
    const invia = async () => {
      elemento.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { fixture, elemento, premi, invia };
  }

  it("l'assistenza libera si prende, e il dettaglio nuovo esce", async () => {
    const dettaglio = { uuid: UUID, assegnata_a: 1 };
    chat.assegna.mockReturnValue(of(dettaglio));
    const { fixture, elemento, premi } = await crea({ tipo: 'assistenza', assegnata_a: null });
    const cambiate: unknown[] = [];
    fixture.componentInstance.cambiata.subscribe((c) => cambiate.push(c));

    expect(elemento.textContent).not.toContain('gestionale.chat.azioni.rinomina');
    await premi('gestionale.chat.azioni.prendi');

    expect(chat.assegna).toHaveBeenCalledWith(UUID, 1);
    expect(cambiate).toEqual([dettaglio]);
    expect(avvisi.mostra).toHaveBeenCalledWith('gestionale.chat.azioni.esiti.presa', 'successo');
  });

  it('la propria assistenza si rilascia e si chiude', async () => {
    chat.assegna.mockReturnValue(of({}));
    chat.impostaStato.mockReturnValue(of({}));
    const { premi } = await crea({ tipo: 'assistenza', assegnata_a: 1 });

    await premi('gestionale.chat.azioni.rilascia');
    await premi('gestionale.chat.azioni.chiudi');

    expect(chat.assegna).toHaveBeenCalledWith(UUID, null);
    expect(chat.impostaStato).toHaveBeenCalledWith(UUID, 'chiusa');
  });

  it('un gruppo si rinomina e si allarga solo con chi non c’è già', async () => {
    chat.rinominaGruppo.mockReturnValue(of({}));
    chat.aggiungiPartecipante.mockReturnValue(of({}));
    const { elemento, premi, invia } = await crea({
      tipo: 'staff',
      titolo: 'Turno',
      partecipanti: [{ id: 1 }] as ConversazioneInterface['partecipanti'],
    });

    await premi('gestionale.chat.azioni.rinomina');
    const nome = elemento.querySelector<HTMLInputElement>('form input')!;
    expect(nome.value).toBe('Turno');
    nome.value = ' Turno sera ';
    nome.dispatchEvent(new Event('input'));
    await invia();
    expect(chat.rinominaGruppo).toHaveBeenCalledWith(UUID, 'Turno sera');

    await premi('gestionale.chat.azioni.aggiungi');
    const scelta = elemento.querySelector<HTMLSelectElement>('form select')!;
    expect(scelta.options.length).toBe(2);
    scelta.selectedIndex = 1;
    scelta.dispatchEvent(new Event('change'));
    await invia();
    expect(chat.aggiungiPartecipante).toHaveBeenCalledWith(UUID, 3);
  });

  it('i gruppi di squadra non si toccano', async () => {
    const { elemento } = await crea({ tipo: 'staff', titolo: '#receptionist' });
    expect(elemento.textContent).not.toContain('gestionale.chat.azioni.esci');
  });

  it('un gruppo chiuso si riapre; uscire riporta all’elenco', async () => {
    chat.impostaStato.mockReturnValue(of({}));
    chat.esci.mockReturnValue(of(null));
    const naviga = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const { premi } = await crea({ tipo: 'staff', titolo: 'Turno', stato: 'chiusa' });

    await premi('gestionale.chat.azioni.riapri');
    await premi('gestionale.chat.azioni.esci');
    expect(chat.impostaStato).toHaveBeenCalledWith(UUID, 'aperta');
    expect(naviga).toHaveBeenCalledWith('/staff/chat');
  });

  it('esporta il PDF della conversazione', async () => {
    chat.esportaPdf.mockReturnValue(of(new Blob(['x'])));
    URL.createObjectURL = vi.fn(() => 'blob:x');
    URL.revokeObjectURL = vi.fn();
    const { premi } = await crea({ tipo: 'staff', titolo: null });

    await premi('gestionale.chat.azioni.pdf');
    expect(chat.esportaPdf).toHaveBeenCalledWith(UUID);
  });
});
