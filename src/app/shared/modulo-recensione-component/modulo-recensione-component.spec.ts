import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { traduzioniTest } from '../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../core/services/lingua/lingua-service';
import { ModuloRecensioneComponent } from './modulo-recensione-component';

describe('ModuloRecensioneComponent', () => {
  const invia = vi.fn();

  beforeEach(() => {
    invia.mockReset();
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [{ provide: LinguaService, useValue: { attiva: () => 'en' } }],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(ModuloRecensioneComponent);
    fixture.componentRef.setInput('invia', invia);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const inviaModulo = async () => {
      elemento.querySelector('form')?.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    const scegli = async (voto: number) => {
      elemento.querySelectorAll<HTMLInputElement>('input[type="radio"]')[voto - 1].click();
      await fixture.whenStable();
    };
    return { elemento, inviaModulo, scegli };
  }

  it('senza stelle non invia', async () => {
    const { elemento, inviaModulo } = await crea();

    await inviaModulo();

    expect(invia).not.toHaveBeenCalled();
    expect(elemento.querySelector('.errore-voto')).not.toBeNull();
  });

  it('invia voto e dettagli nella lingua del sito, poi ringrazia', async () => {
    invia.mockReturnValue(of({}));
    const { elemento, inviaModulo, scegli } = await crea();

    await scegli(4);
    await inviaModulo();

    expect(invia).toHaveBeenCalledWith(
      expect.objectContaining({ voto: 4, voto_pulizia: null, anonima: false, lingua: 'en' }),
    );
    expect(elemento.querySelector('form')).toBeNull();
    expect(elemento.querySelector('.esito-ok')?.textContent).toContain('recensione.grazie');
  });

  it('se il backend rifiuta spiega perché', async () => {
    invia.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { errore: { codice: 'RECENSIONE_GIA_PRESENTE', messaggio: 'Già recensito' } },
          }),
      ),
    );
    const { elemento, inviaModulo, scegli } = await crea();

    await scegli(5);
    await inviaModulo();

    expect(elemento.querySelector('.esito-errore')?.textContent).toContain('Già recensito');
  });
});
