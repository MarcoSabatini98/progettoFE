import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { ContenutiService } from '../../../core/services/contenuti/contenuti-service';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { ImpostazioneInterface } from '../../../shared/models/impostazione/impostazione-model';
import { ImpostazioniComponent } from './impostazioni-component';

describe('ImpostazioniComponent', () => {
  const impostazioni = { elencaImpostazioni: vi.fn(), leggiPubbliche: vi.fn() };
  const contenuti = { elencaMedia: vi.fn() };
  const auth = { haPermessi: vi.fn() };
  const voce = (chiave: string, gruppo: string) =>
    ({ chiave, gruppo, valore: '', tipo: 'testo' }) as ImpostazioneInterface;

  beforeEach(() => {
    impostazioni.elencaImpostazioni.mockReturnValue(
      of([
        voce('aspetto_colore', 'aspetto'),
        voce('orario_checkin', 'soggiorno'),
        voce('struttura_cin', 'struttura'),
        voce('struttura_nome', 'struttura'),
      ]),
    );
    impostazioni.leggiPubbliche.mockReset();
    impostazioni.leggiPubbliche.mockReturnValue(of({}));
    contenuti.elencaMedia.mockReset();
    contenuti.elencaMedia.mockReturnValue(of([]));
    auth.haPermessi.mockReturnValue(true);
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: ImpostazioniService, useValue: impostazioni },
        { provide: ContenutiService, useValue: contenuti },
        { provide: AuthService, useValue: auth },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(ImpostazioniComponent);
    await fixture.whenStable();
    return { fixture, elemento: fixture.nativeElement as HTMLElement };
  }

  it('un modulo per gruppo nell’ordine del gestionale, logo e sfondi dopo l’aspetto', async () => {
    const { elemento } = await crea();

    const schede = [...elemento.querySelectorAll('.schede > *')];
    expect(schede.map((scheda) => scheda.tagName.toLowerCase())).toEqual([
      'app-gruppo-impostazioni',
      'app-gruppo-impostazioni',
      'app-galleria-media',
      'app-galleria-media',
      'app-galleria-media',
      'app-gruppo-impostazioni',
    ]);
    const gruppi = [...elemento.querySelectorAll('app-gruppo-impostazioni h2')];
    expect(gruppi.map((titolo) => titolo.textContent?.trim())).toEqual([
      'gestionale.impostazioni.gruppi.struttura',
      'gestionale.impostazioni.gruppi.aspetto',
      'gestionale.impostazioni.gruppi.soggiorno',
    ]);
    const struttura = [...schede[0].querySelectorAll('app-campo')];
    expect(struttura.map((campo) => campo.textContent?.trim())).toEqual([
      'gestionale.impostazioni.chiavi.struttura_nome',
      'gestionale.impostazioni.chiavi.struttura_cin',
    ]);
    expect(contenuti.elencaMedia).toHaveBeenCalledWith({ entita: 'logo' });
    expect(contenuti.elencaMedia).toHaveBeenCalledWith({ entita: 'home' });
    expect(contenuti.elencaMedia).toHaveBeenCalledWith({ entita: 'home_scuro' });
    const [, chiaro, scuro] = elemento.querySelectorAll<HTMLInputElement>(
      'app-galleria-media input[type="file"]',
    );
    expect(chiaro.accept).toContain('video/mp4');
    expect(scuro.accept).toContain('video/mp4');
  });

  it('senza permesso sui contenuti niente logo né sfondo', async () => {
    auth.haPermessi.mockReturnValue(false);
    const { elemento } = await crea();

    expect(contenuti.elencaMedia).not.toHaveBeenCalled();
    expect(elemento.querySelector('app-galleria-media')).toBeNull();
  });

  it('dopo un salvataggio o un logo nuovo il sito rilegge le pubbliche', async () => {
    const { fixture } = await crea();

    fixture.componentInstance.aggiornaSito();
    fixture.componentInstance.logoCambiato();

    expect(impostazioni.leggiPubbliche).toHaveBeenCalledTimes(2);
  });

  it('mostra il messaggio se le impostazioni non si caricano', async () => {
    impostazioni.elencaImpostazioni.mockReturnValue(
      throwError(
        () => new HttpErrorResponse({ status: 500, error: { errore: { messaggio: 'Guasto' } } }),
      ),
    );
    const { elemento } = await crea();

    expect(elemento.querySelector('[role=alert]')?.textContent).toContain('Guasto');
  });
});
