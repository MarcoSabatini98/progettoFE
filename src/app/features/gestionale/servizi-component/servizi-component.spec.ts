import { signal } from '@angular/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { CamereService } from '../../../core/services/camere/camere-service';
import { ContenutiService } from '../../../core/services/contenuti/contenuti-service';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { apriSezione } from '../listino-component/sezione-listino-test';
import { ServiziComponent } from './servizi-component';

describe('ServiziComponent', () => {
  const colazione = {
    id: 3,
    nome: 'Colazione',
    descrizione: null,
    icona: 'free_breakfast',
    tipo: 'extra',
    prezzo: '12.00',
    calcolo_prezzo: 'a_persona_notte',
    aliquota_iva: null,
    ordine: 0,
    attivo: false,
  };
  const wifi = { ...colazione, id: 4, nome: 'Wi-Fi', icona: null, tipo: 'dotazione', attivo: true };
  const camere = {
    elencaServizi: vi.fn(),
    creaServizio: vi.fn(),
    aggiornaServizio: vi.fn(),
    eliminaServizio: vi.fn(),
    leggiServizio: vi.fn(),
  };

  beforeEach(() => {
    Object.values(camere).forEach((spia) => spia.mockReset());
    camere.elencaServizi.mockReturnValue(of([colazione, wifi]));
    camere.creaServizio.mockReturnValue(of(colazione));
    camere.leggiServizio.mockReturnValue(
      of({
        ...colazione,
        media: [{ id: 1, percorso: 'media/colazione.jpg', testo_alternativo: 'Buffet' }],
      }),
    );
  });

  const apri = (gestisceContenuti = true) =>
    apriSezione(ServiziComponent, {}, {}, [
      { provide: CamereService, useValue: camere },
      { provide: ContenutiService, useValue: { leggiTraduzioni: () => of({}) } },
      { provide: AvvisiService, useValue: { mostra: vi.fn() } },
      { provide: AuthService, useValue: { haPermessi: () => gestisceContenuti } },
      {
        provide: LinguaService,
        useValue: { disponibili: signal(['it', 'en']), attiva: () => 'it' },
      },
    ]);

  it('elenca i servizi con tipo, prezzo degli extra e stato', async () => {
    const { elemento } = await apri();
    const voci = elemento.querySelectorAll('.voce');

    expect(voci[0].textContent).toContain('camere.calcolo.a_persona_notte');
    expect(voci[0].textContent).toContain('gestionale.tariffe.disattivato');
    expect(voci[1].textContent).toContain('gestionale.servizi.tipi.dotazione');
    expect(voci[1].textContent).not.toContain('camere.calcolo');
  });

  it('il prezzo si chiede solo per gli extra e va nel nuovo servizio', async () => {
    const { campo, scrivi, invia } = await apri();
    expect(campo('prezzo')).toBeNull();

    await scrivi('nome', 'Transfer');
    await scrivi('tipo', 'extra', 'change');
    await scrivi('prezzo', '40');
    await invia();

    expect(camere.creaServizio).toHaveBeenCalledWith(
      expect.objectContaining({ nome: 'Transfer', tipo: 'extra', prezzo: 40 }),
    );
  });

  it('il servizio scelto mostra foto e traduzioni', async () => {
    const { elemento, scegli } = await apri();

    await scegli(0);

    expect(camere.leggiServizio).toHaveBeenCalledWith(3);
    expect(elemento.querySelector('app-galleria-media img')?.getAttribute('alt')).toBe('Buffet');
    expect(elemento.querySelector('app-traduzioni')).not.toBeNull();
  });

  it('senza il permesso sui contenuti niente galleria', async () => {
    const { elemento, scegli } = await apri(false);

    await scegli(0);

    expect(camere.leggiServizio).not.toHaveBeenCalled();
    expect(elemento.querySelector('app-galleria-media')).toBeNull();
  });
});
