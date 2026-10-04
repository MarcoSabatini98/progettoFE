import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { ContenutiService } from '../../../core/services/contenuti/contenuti-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { TraduzioniComponent } from './traduzioni-component';

describe('TraduzioniComponent', () => {
  const auth = { haPermessi: vi.fn() };
  const lingua = { disponibili: signal(['it', 'en', 'fr']) };
  const avvisi = { mostra: vi.fn() };
  const contenuti = { leggiTraduzioni: vi.fn(), salvaTraduzioni: vi.fn() };
  const salvate = { en: { nome: 'Romantic weekend', descrizione: 'Two nights' } };

  beforeEach(() => {
    auth.haPermessi.mockReturnValue(true);
    lingua.disponibili.set(['it', 'en', 'fr']);
    contenuti.leggiTraduzioni.mockReset().mockReturnValue(of(salvate));
    contenuti.salvaTraduzioni.mockReset().mockReturnValue(of(salvate));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: LinguaService, useValue: lingua },
        { provide: AvvisiService, useValue: avvisi },
        { provide: ContenutiService, useValue: contenuti },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(TraduzioniComponent);
    fixture.componentRef.setInput('entita', 'pacchetto');
    fixture.componentRef.setInput('entitaId', 7);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    return { fixture, elemento };
  }

  it('senza permesso non mostra niente e non chiede le traduzioni', async () => {
    auth.haPermessi.mockReturnValue(false);
    const { elemento } = await crea();

    expect(elemento.textContent?.trim()).toBe('');
    expect(contenuti.leggiTraduzioni).not.toHaveBeenCalled();
  });

  it('un gruppo per lingua attiva tranne l’italiano, coi testi salvati', async () => {
    const { elemento } = await crea();
    const gruppi = elemento.querySelectorAll('fieldset');

    expect(contenuti.leggiTraduzioni).toHaveBeenCalledWith('pacchetto', 7);
    expect(
      [...gruppi].map((gruppo) => gruppo.querySelector('legend')?.textContent?.trim()),
    ).toEqual(['English', 'Français']);
    expect(gruppi[0].querySelector<HTMLInputElement>('input')!.value).toBe('Romantic weekend');
    expect(gruppi[0].querySelector('textarea')!.lang).toBe('en');
  });

  it('salva tutte le lingue insieme', async () => {
    const { fixture, elemento } = await crea();
    const titolo = elemento.querySelectorAll<HTMLInputElement>('fieldset input')[1];
    titolo.value = 'Week-end romantique';
    titolo.dispatchEvent(new Event('input'));

    elemento.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(contenuti.salvaTraduzioni).toHaveBeenCalledWith('pacchetto', 7, {
      en: { nome: 'Romantic weekend', descrizione: 'Two nights' },
      fr: { nome: 'Week-end romantique', descrizione: '' },
    });
    expect(avvisi.mostra).toHaveBeenCalledWith(expect.any(String), 'successo');
  });

  it('solo italiano attivo: lo dice e non chiede niente', async () => {
    lingua.disponibili.set(['it']);
    const { elemento } = await crea();

    expect(elemento.textContent).toContain('gestionale.traduzioni.nessunaLingua');
    expect(contenuti.leggiTraduzioni).not.toHaveBeenCalled();
  });
});
