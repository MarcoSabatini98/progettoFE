import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { RecensioniService } from '../../../core/services/recensioni/recensioni-service';
import { RecensionePubblicaInterface } from '../../../shared/models/recensione/recensione-model';
import { ValutazioniInterface } from '../../../shared/models/valutazioni/valutazioni-model';
import { RecensioniComponent } from './recensioni-component';

describe('RecensioniComponent', () => {
  const recensioni = { leggiValutazioni: vi.fn(), elencaPubbliche: vi.fn() };
  const valutazioni = {
    numero_recensioni: 12,
    media: '4.60',
    media_pulizia: '4.80',
    media_personale: null,
    media_posizione: '4.00',
    media_comfort: null,
    media_qualita_prezzo: null,
  } as unknown as ValutazioniInterface;
  const recensione = (id: number) =>
    ({
      id,
      voto: 5,
      autore: null,
      paese: null,
      creato_il: '2026-09-01',
    }) as RecensionePubblicaInterface;
  const pagina = (numero: number, elementi: RecensionePubblicaInterface[]) =>
    of({ elementi, totale: 3, pagina: numero, perPagina: 10, pagine: 2 });

  beforeEach(() => {
    recensioni.leggiValutazioni.mockReturnValue(of(valutazioni));
    recensioni.elencaPubbliche.mockReset();
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: RecensioniService, useValue: recensioni },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(RecensioniComponent);
    await fixture.whenStable();
    return fixture;
  }

  it('mostra la media e solo le categorie votate', async () => {
    recensioni.elencaPubbliche.mockReturnValue(pagina(1, [recensione(1)]));

    const elemento = (await crea()).nativeElement as HTMLElement;

    expect(elemento.querySelector('.media-valore')?.textContent).toContain('4,6');
    expect([...elemento.querySelectorAll('dt')].map((dt) => dt.textContent)).toEqual([
      'recensioni.categorie.media_pulizia',
      'recensioni.categorie.media_posizione',
    ]);
  });

  it('"mostra altre" accoda la pagina successiva e sparisce all’ultima', async () => {
    recensioni.elencaPubbliche
      .mockReturnValueOnce(pagina(1, [recensione(1), recensione(2)]))
      .mockReturnValueOnce(pagina(2, [recensione(3)]));
    const fixture = await crea();
    const elemento = fixture.nativeElement as HTMLElement;

    elemento.querySelector<HTMLButtonElement>('.altre')!.click();
    await fixture.whenStable();

    expect(recensioni.elencaPubbliche).toHaveBeenLastCalledWith({ pagina: 2, perPagina: 10 });
    expect(elemento.querySelectorAll('app-scheda-recensione')).toHaveLength(3);
    expect(elemento.querySelector('.altre')).toBeNull();
  });

  it('senza recensioni nasconde il riepilogo e lo dice', async () => {
    recensioni.leggiValutazioni.mockReturnValue(of({ ...valutazioni, numero_recensioni: 0 }));
    recensioni.elencaPubbliche.mockReturnValue(of({ elementi: [], pagina: 1, pagine: 0 }));

    const elemento = (await crea()).nativeElement as HTMLElement;

    expect(elemento.querySelector('.riepilogo')).toBeNull();
    expect(elemento.querySelector('.stato-vuoto')?.textContent).toContain('recensioni.nessuna');
  });

  it('se il backend non risponde mostra un errore', async () => {
    recensioni.leggiValutazioni.mockReturnValue(throwError(() => new Error('500')));
    recensioni.elencaPubbliche.mockReturnValue(throwError(() => new Error('500')));

    const elemento = (await crea()).nativeElement as HTMLElement;

    expect(elemento.querySelector('.stato-vuoto')?.textContent).toContain('errori.generico');
  });
});
