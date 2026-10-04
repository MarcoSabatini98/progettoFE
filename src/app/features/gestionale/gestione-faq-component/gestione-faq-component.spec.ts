import { signal } from '@angular/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { ContenutiService } from '../../../core/services/contenuti/contenuti-service';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { apriSezione } from '../listino-component/sezione-listino-test';
import { GestioneFaqComponent } from './gestione-faq-component';

describe('GestioneFaqComponent', () => {
  const faq = {
    id: 4,
    domanda: 'A che ora è il check-in?',
    risposta: 'Dalle 15.',
    categoria: 'Arrivo',
    ordine: 1,
    pubblicata: false,
  };
  const contenuti = {
    elencaFaq: vi.fn(),
    creaFaq: vi.fn(),
    aggiornaFaq: vi.fn(),
    eliminaFaq: vi.fn(),
    leggiTraduzioni: vi.fn(),
  };

  beforeEach(() => {
    Object.values(contenuti).forEach((spia) => spia.mockReset());
    contenuti.elencaFaq.mockReturnValue(of([faq, { ...faq, id: 5, categoria: null }]));
    contenuti.creaFaq.mockReturnValue(of(faq));
    contenuti.leggiTraduzioni.mockReturnValue(of({}));
  });

  const apri = () =>
    apriSezione(GestioneFaqComponent, {}, {}, [
      { provide: ContenutiService, useValue: contenuti },
      { provide: AvvisiService, useValue: { mostra: vi.fn() } },
      { provide: AuthService, useValue: { haPermessi: () => true } },
      { provide: LinguaService, useValue: { disponibili: signal(['it', 'en']) } },
    ]);

  it('elenca le domande con categoria e stato, e propone le categorie già usate', async () => {
    const { elemento } = await apri();
    const voci = elemento.querySelectorAll('.voce');

    expect(voci[0].textContent).toContain('Arrivo');
    expect(voci[0].textContent).toContain('gestionale.faq.nascosta');
    expect(voci[1].textContent).toContain('gestionale.faq.senzaCategoria');
    expect(
      [...elemento.querySelectorAll('datalist option')].map((voce) => voce.getAttribute('value')),
    ).toEqual(['Arrivo']);
  });

  it('nuova domanda: domanda, risposta, categoria, ordine e visibilità', async () => {
    const { scrivi, invia } = await apri();
    await scrivi('domanda', 'C’è il parcheggio?');
    await scrivi('risposta', 'Sì, gratuito.');
    await scrivi('categoria', 'Servizi');
    await scrivi('ordine', '2');

    await invia();

    expect(contenuti.creaFaq).toHaveBeenCalledWith({
      domanda: 'C’è il parcheggio?',
      risposta: 'Sì, gratuito.',
      categoria: 'Servizi',
      ordine: 2,
      pubblicata: true,
    });
  });

  it('senza risposta non crea', async () => {
    const { scrivi, invia } = await apri();
    await scrivi('domanda', 'C’è il parcheggio?');

    await invia();

    expect(contenuti.creaFaq).not.toHaveBeenCalled();
  });

  it('la domanda scelta mostra le sue traduzioni', async () => {
    const { elemento, scegli } = await apri();
    expect(elemento.querySelector('app-traduzioni')).toBeNull();

    await scegli(0);

    expect(contenuti.leggiTraduzioni).toHaveBeenCalledWith('faq', 4);
    expect(elemento.querySelector('app-traduzioni fieldset')).not.toBeNull();
  });
});
