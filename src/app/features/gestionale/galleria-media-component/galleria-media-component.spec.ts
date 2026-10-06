import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ContenutiService } from '../../../core/services/contenuti/contenuti-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { GalleriaMediaComponent } from './galleria-media-component';

describe('GalleriaMediaComponent', () => {
  const contenuti = {
    caricaMedia: vi.fn(),
    aggiornaMedia: vi.fn(),
    riordinaMedia: vi.fn(),
    eliminaMedia: vi.fn(),
  };
  const media = [
    { id: 4, percorso: 'media/a.jpg', tipo_mime: 'image/jpeg', testo_alternativo: 'Letto' },
    { id: 5, percorso: 'media/b.jpg', tipo_mime: 'image/jpeg', testo_alternativo: 'Bagno' },
  ];

  beforeEach(() => {
    Object.values(contenuti).forEach((spia) => spia.mockReset().mockReturnValue(of(null)));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [{ provide: ContenutiService, useValue: contenuti }],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(GalleriaMediaComponent);
    fixture.componentRef.setInput('entita', 'tipologia_camera');
    fixture.componentRef.setInput('entitaId', 2);
    fixture.componentRef.setInput('media', media);
    fixture.componentRef.setInput('descrizione', 'Doppia');
    const cambiati = vi.fn();
    fixture.componentInstance.cambiati.subscribe(cambiati);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const clicca = async (etichetta: string, indice = 0) => {
      elemento.querySelectorAll<HTMLButtonElement>(`[aria-label="${etichetta}"]`)[indice].click();
      await fixture.whenStable();
    };
    return { fixture, elemento, clicca, cambiati };
  }

  it('carica più foto in coda, in fondo alla galleria, con la descrizione della scheda', async () => {
    const { fixture, elemento, cambiati } = await crea();
    const campo = elemento.querySelector<HTMLInputElement>('input[type="file"]')!;
    const foto = [new File(['a'], 'a.jpg'), new File(['b'], 'b.jpg')];
    Object.defineProperty(campo, 'files', { value: foto });

    campo.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(contenuti.caricaMedia).toHaveBeenNthCalledWith(1, {
      entita: 'tipologia_camera',
      entita_id: 2,
      testo_alternativo: 'Doppia',
      ordine: 2,
      file: foto[0],
    });
    expect(contenuti.caricaMedia).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ ordine: 3 }),
    );
    expect(cambiati).toHaveBeenCalledOnce();
  });

  it('sposta una foto scambiandola con la vicina; la prima non sale', async () => {
    const { elemento, clicca } = await crea();
    const sali = elemento.querySelectorAll<HTMLButtonElement>(
      '[aria-label="gestionale.foto.prima"]',
    );
    expect(sali[0].disabled).toBe(true);

    await clicca('gestionale.foto.dopo');

    expect(contenuti.riordinaMedia).toHaveBeenCalledWith([5, 4]);
  });

  it('salva il testo alternativo solo se cambiato, vuoto come null', async () => {
    const { fixture, elemento } = await crea();
    const testo = elemento.querySelector<HTMLInputElement>('input[type="text"]')!;

    testo.dispatchEvent(new Event('change'));
    testo.value = '  ';
    testo.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(contenuti.aggiornaMedia).toHaveBeenCalledOnce();
    expect(contenuti.aggiornaMedia).toHaveBeenCalledWith(4, { testo_alternativo: null });
  });

  it('elimina una foto solo dopo la conferma', async () => {
    const { elemento, clicca } = await crea();

    await clicca('gestionale.foto.elimina', 1);
    expect(contenuti.eliminaMedia).not.toHaveBeenCalled();
    elemento.querySelector<HTMLButtonElement>('.pulsante-pericolo')!.click();

    expect(contenuti.eliminaMedia).toHaveBeenCalledWith(5);
  });

  it('foto del sito: senza scheda va senza id e coi testi della sezione', async () => {
    const fixture = TestBed.createComponent(GalleriaMediaComponent);
    fixture.componentRef.setInput('entita', 'home');
    fixture.componentRef.setInput('media', []);
    fixture.componentRef.setInput('descrizione', 'Home');
    fixture.componentRef.setInput('chiave', 'gestionale.contenuti.foto.home');
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const campo = elemento.querySelector<HTMLInputElement>('input[type="file"]')!;
    Object.defineProperty(campo, 'files', { value: [new File(['a'], 'a.jpg')] });

    campo.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(elemento.textContent).toContain('gestionale.contenuti.foto.home.titolo');
    expect(contenuti.caricaMedia).toHaveBeenCalledWith(
      expect.objectContaining({ entita: 'home', entita_id: null, ordine: 0 }),
    );
  });

  it('solo foto di norma; con conVideo accetta MP4 e WebM e li mostra come video', async () => {
    const { fixture, elemento } = await crea();
    const campo = elemento.querySelector<HTMLInputElement>('input[type="file"]')!;
    expect(campo.accept).not.toContain('video');

    fixture.componentRef.setInput('conVideo', true);
    fixture.componentRef.setInput('media', [
      { id: 6, percorso: 'media/v.mp4', tipo_mime: 'video/mp4', testo_alternativo: 'Mare' },
    ]);
    await fixture.whenStable();

    expect(campo.accept).toContain('video/mp4');
    expect(elemento.querySelector('video')?.getAttribute('aria-label')).toBe('Mare');
    expect(elemento.querySelector('.foto img')).toBeNull();
  });
});
