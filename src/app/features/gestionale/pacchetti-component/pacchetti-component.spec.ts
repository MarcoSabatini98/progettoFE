import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { CamereService } from '../../../core/services/camere/camere-service';
import { ContenutiService } from '../../../core/services/contenuti/contenuti-service';
import { apriSezione } from '../listino-component/sezione-listino-test';
import { PacchettiComponent } from './pacchetti-component';

describe('PacchettiComponent', () => {
  const pacchetto = {
    id: 4,
    nome: 'Romantico',
    prezzo: '320.00',
    tipologia_id: null,
    notti_min: 2,
    attivo: true,
    ordine: 0,
    servizi: [{ id: 9, nome: 'Cena', PacchettoServizio: { quantita: 2 } }],
    media: [
      {
        id: 1,
        percorso: 'media/romantico.jpg',
        tipo_mime: 'image/jpeg',
        testo_alternativo: 'Terrazza',
      },
    ],
  };

  async function apri(gestisceContenuti = true) {
    const tariffe = {
      elencaPacchetti: vi.fn(() => of([pacchetto])),
      creaPacchetto: vi.fn(() => of(pacchetto)),
      aggiornaPacchetto: vi.fn(() => of(pacchetto)),
      eliminaPacchetto: vi.fn(() => of(null)),
    };
    const camere = {
      elencaServizi: vi.fn(() => of([{ id: 9, nome: 'Cena', prezzo: '60.00' }])),
    };
    const sezione = await apriSezione(PacchettiComponent, tariffe, { tipologie: [] }, [
      { provide: CamereService, useValue: camere },
      { provide: ContenutiService, useValue: {} },
      { provide: AuthService, useValue: { haPermessi: () => gestisceContenuti } },
    ]);
    return { ...sezione, tariffe };
  }

  it('il pacchetto scelto spunta i suoi servizi con la quantità e mostra le foto', async () => {
    const { elemento, scegli } = await apri();

    await scegli();

    expect(
      elemento.querySelector<HTMLInputElement>('.servizi input[type="checkbox"]')!.checked,
    ).toBe(true);
    expect(elemento.querySelector<HTMLInputElement>('.servizi input[type="number"]')!.value).toBe(
      '2',
    );
    expect(
      elemento.querySelector('app-galleria-media .miniatura')?.getAttribute('aria-label'),
    ).toBe('Terrazza');
  });

  it('un pacchetto nuovo non ha foto e manda i servizi scelti', async () => {
    const { fixture, elemento, tariffe, scrivi, invia } = await apri();
    expect(elemento.querySelector('app-galleria-media')).toBeNull();

    await scrivi('nome', 'Benessere');
    await scrivi('prezzo', '199');
    elemento.querySelector<HTMLInputElement>('.servizi input[type="checkbox"]')!.click();
    await fixture.whenStable();
    await invia();

    expect(tariffe.creaPacchetto).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'Benessere',
        prezzo: 199,
        servizi: [{ servizio_id: 9, quantita: 1 }],
      }),
    );
  });

  it('senza il permesso sui contenuti la galleria non compare', async () => {
    const { elemento, scegli } = await apri(false);

    await scegli();

    expect(elemento.querySelector('app-galleria-media')).toBeNull();
  });
});
