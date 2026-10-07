import { signal } from '@angular/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { ContenutiService } from '../../../core/services/contenuti/contenuti-service';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { apriSezione } from '../listino-component/sezione-listino-test';
import { GestionePagineComponent } from './gestione-pagine-component';

describe('GestionePagineComponent', () => {
  const sezione = {
    id: 7,
    pagina_id: 1,
    titolo: 'Colazione in terrazza',
    testo: 'Ogni mattina.',
    ordine: 0,
    pubblicata: false,
    media: [],
  };
  const pagine = [
    { id: 1, chiave: 'home', descrizione: null, media: [], sezioni: [sezione] },
    { id: 2, chiave: 'struttura', descrizione: 'Casa sul mare', media: [], sezioni: [] },
  ];
  const contenuti = {
    elencaPagine: vi.fn(),
    aggiornaPagina: vi.fn(),
    creaSezione: vi.fn(),
    aggiornaSezione: vi.fn(),
    eliminaSezione: vi.fn(),
    leggiTraduzioni: vi.fn(),
    caricaMedia: vi.fn(),
  };

  beforeEach(() => {
    Object.values(contenuti).forEach((spia) => spia.mockReset());
    contenuti.elencaPagine.mockReturnValue(of(pagine));
    contenuti.creaSezione.mockReturnValue(of(sezione));
    contenuti.aggiornaPagina.mockReturnValue(of(pagine[1]));
    contenuti.leggiTraduzioni.mockReturnValue(of({}));
  });

  const apri = async () => {
    const aperta = await apriSezione(GestionePagineComponent, {}, {}, [
      { provide: ContenutiService, useValue: contenuti },
      { provide: AvvisiService, useValue: { mostra: vi.fn() } },
      { provide: AuthService, useValue: { haPermessi: () => true } },
      { provide: LinguaService, useValue: { disponibili: signal(['it', 'en']) } },
    ]);
    const pagina = async (indice: number) => {
      aperta.elemento.querySelectorAll<HTMLButtonElement>('.linguette button')[indice].click();
      await aperta.fixture.whenStable();
    };
    return { ...aperta, pagina };
  };

  it("l'immagine scelta con la sezione nuova si carica appena la sezione esiste", async () => {
    contenuti.caricaMedia.mockReturnValue(of({ id: 1 }));
    const { fixture, elemento, scrivi, invia } = await apri();
    const file = new File(['x'], 'giardino.jpg', { type: 'image/jpeg' });
    const campo = elemento.querySelector<HTMLInputElement>('input[type="file"]')!;
    Object.defineProperty(campo, 'files', { value: [file] });
    campo.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(elemento.querySelector('.scegli-immagine')?.textContent).toContain('giardino.jpg');
    await scrivi('titolo', 'Il giardino');
    await scrivi('testo', 'Ulivi e lavanda.');

    await invia();

    expect(contenuti.caricaMedia).toHaveBeenCalledWith({
      entita: 'sezione',
      entita_id: 7,
      testo_alternativo: 'Colazione in terrazza',
      ordine: 0,
      file,
    });
  });

  it('apre sulla home: le sue sezioni, senza descrizione né copertina', async () => {
    const { elemento } = await apri();

    expect(elemento.querySelector('.voce')?.textContent).toContain('Colazione in terrazza');
    expect(elemento.querySelector('.voce')?.textContent).toContain('gestionale.pagine.nascosta');
    expect(elemento.textContent).toContain('gestionale.pagine.homeAiuto');
    expect(elemento.querySelector('app-galleria-media')).toBeNull();
  });

  it('nuova sezione sulla pagina scelta', async () => {
    const { scrivi, invia } = await apri();
    await scrivi('titolo', 'Il giardino');
    await scrivi('testo', 'Ulivi e lavanda.');

    await invia();

    expect(contenuti.creaSezione).toHaveBeenCalledWith({
      pagina_id: 1,
      titolo: 'Il giardino',
      testo: 'Ulivi e lavanda.',
      ordine: 0,
      pubblicata: true,
    });
    expect(contenuti.caricaMedia).not.toHaveBeenCalled();
  });

  it('struttura: descrizione salvata (vuota = quella predefinita) e foto di copertina', async () => {
    const { elemento, pagina, campo, scrivi, invia } = await apri();
    await pagina(1);

    expect(campo('descrizione').value).toBe('Casa sul mare');
    expect(elemento.querySelector('.voce')).toBeNull();
    expect(elemento.querySelector('app-galleria-media')).not.toBeNull();

    await scrivi('descrizione', '  ');
    await invia();

    expect(contenuti.aggiornaPagina).toHaveBeenCalledWith(2, { descrizione: null });
  });

  it('la sezione scelta mostra immagine e traduzioni', async () => {
    const { elemento, scegli } = await apri();

    await scegli(0);

    expect(elemento.querySelector('app-listino app-galleria-media')).not.toBeNull();
    expect(contenuti.leggiTraduzioni).toHaveBeenCalledWith('sezione', 7);
  });
});
