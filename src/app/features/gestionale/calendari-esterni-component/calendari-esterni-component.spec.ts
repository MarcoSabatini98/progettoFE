import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { CalendariService } from '../../../core/services/calendari/calendari-service';
import { CamereService } from '../../../core/services/camere/camere-service';
import { apriSezione } from '../listino-component/sezione-listino-test';
import { CalendariEsterniComponent } from './calendari-esterni-component';

describe('CalendariEsterniComponent', () => {
  const calendario = (id: number, nome: string, errori = 0) => ({
    id,
    camera_id: 1,
    camera: { id: 1, numero: '101', nome: null },
    canale: 'airbnb',
    nome,
    url: `https://airbnb.it/calendar/${id}.ics`,
    attivo: true,
    ultima_sincronizzazione_il: '2026-10-04T10:00:00Z',
    ultimo_esito: 'OK: 3 eventi',
    errori_consecutivi: errori,
  });

  async function apri(input: Record<string, unknown> = {}) {
    const calendari = {
      elencaCalendari: vi.fn(() => of([calendario(4, 'Airbnb 101', 2), calendario(5, 'Airbnb 2')])),
      creaCalendario: vi.fn(() => of(calendario(6, 'Booking 101'))),
      aggiornaCalendario: vi.fn(() => of(calendario(4, 'Airbnb 101'))),
      eliminaCalendario: vi.fn(() => of(null)),
      sincronizza: vi.fn(() => of(3)),
    };
    const avvisi = { mostra: vi.fn() };
    const sezione = await apriSezione(CalendariEsterniComponent, {}, input, [
      { provide: CalendariService, useValue: calendari },
      { provide: CamereService, useValue: { elencaCamere: () => of([{ id: 1, numero: '101' }]) } },
      { provide: AvvisiService, useValue: avvisi },
    ]);
    const sincronizza = async () => {
      sezione.elemento.querySelector<HTMLButtonElement>('.sincronizzazione button')!.click();
      await sezione.fixture.whenStable();
    };
    return { ...sezione, calendari, avvisi, sincronizza };
  }

  it('la riga mostra portale, camera ed errori di fila', async () => {
    const { elemento } = await apri();

    const voce = elemento.querySelector('.voce')!.textContent;
    expect(voce).toContain('Airbnb 101');
    expect(voce).toContain('gestionale.canali.airbnb');
    expect(voce).toContain('gestionale.calendari.esterni.esitoErrore');
    expect(voce).toContain('gestionale.calendari.esterni.errori');
  });

  it('il calendario nuovo manda la camera scelta', async () => {
    const { calendari, scrivi, invia } = await apri();
    await scrivi('camera_id', '1: 1', 'change');
    await scrivi('nome', 'Booking 101');
    await scrivi('url', 'https://booking.com/ical/101.ics');

    await invia();

    expect(calendari.creaCalendario).toHaveBeenCalledWith({
      camera_id: 1,
      canale: 'booking_com',
      nome: 'Booking 101',
      url: 'https://booking.com/ical/101.ics',
      attivo: true,
    });
  });

  it('un link che non è un indirizzo web non si salva', async () => {
    const { calendari, scrivi, invia } = await apri();
    await scrivi('camera_id', '1: 1', 'change');
    await scrivi('nome', 'Booking 101');
    await scrivi('url', 'booking.com/ical');

    await invia();

    expect(calendari.creaCalendario).not.toHaveBeenCalled();
  });

  it('il link della notifica apre quel calendario e la camera non si cambia', async () => {
    const { elemento, campo } = await apri({ apri: 5 });

    const voci = elemento.querySelectorAll('.voce');
    expect(voci[1].getAttribute('aria-pressed')).toBe('true');
    expect(campo('nome').value).toBe('Airbnb 2');
    expect(campo('camera_id')).toBeNull();
  });

  it('sincronizza ora: avvisa quanti eventi ha letto e ricarica l’elenco', async () => {
    const { calendari, avvisi, scegli, sincronizza } = await apri();
    await scegli();

    await sincronizza();

    expect(calendari.sincronizza).toHaveBeenCalledWith(4);
    expect(avvisi.mostra).toHaveBeenCalledWith(
      'gestionale.calendari.esterni.sincronizzato',
      'successo',
    );
    expect(calendari.elencaCalendari).toHaveBeenCalledTimes(2);
  });

  it('se il portale non risponde lo spiega', async () => {
    const { elemento, calendari, scegli, sincronizza } = await apri();
    calendari.sincronizza.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: {
              errore: { codice: 'SINCRONIZZAZIONE_FALLITA', messaggio: 'Feed non trovato' },
            },
          }),
      ),
    );
    await scegli();

    await sincronizza();

    expect(elemento.querySelector('[role=alert]')?.textContent).toContain('Feed non trovato');
  });
});
