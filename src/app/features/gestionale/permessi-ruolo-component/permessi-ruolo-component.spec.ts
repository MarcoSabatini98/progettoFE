import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { PermessiService } from '../../../core/services/permessi/permessi-service';
import { PermessiRuoloComponent } from './permessi-ruolo-component';

describe('PermessiRuoloComponent', () => {
  const ruoli = { impostaPermessi: vi.fn() };
  const avvisi = { mostra: vi.fn() };
  const catalogo = [
    { codice: 'pulizie.leggi', modulo: 'pulizie', descrizione: '' },
    { codice: 'pulizie.esegui', modulo: 'pulizie', descrizione: '' },
    { codice: 'chat.assistenza', modulo: 'chat', descrizione: '' },
  ];
  const ruolo = {
    codice: 'housekeeper',
    nome: 'Addetto pulizie',
    descrizione: null,
    staff: true,
    permessi: ['pulizie.leggi'],
  };

  beforeEach(() => {
    ruoli.impostaPermessi.mockReset();
    avvisi.mostra.mockReset();
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: PermessiService, useValue: ruoli },
        { provide: AvvisiService, useValue: avvisi },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(PermessiRuoloComponent);
    fixture.componentRef.setInput('ruolo', ruolo);
    fixture.componentRef.setInput('catalogo', catalogo);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const caselle = () => [...elemento.querySelectorAll<HTMLInputElement>('input[type=checkbox]')];
    const salva = async () => {
      elemento.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { elemento, caselle, salva };
  }

  it('raggruppa i permessi per modulo e spunta quelli del ruolo', async () => {
    const { elemento, caselle } = await crea();

    expect(elemento.querySelectorAll('legend')).toHaveLength(2);
    expect(caselle().map((casella) => casella.checked)).toEqual([true, false, false]);
  });

  it('salva le caselle spuntate', async () => {
    ruoli.impostaPermessi.mockReturnValue(of(['chat.assistenza']));
    const { caselle, salva } = await crea();

    caselle()[0].click();
    caselle()[2].click();
    await salva();

    expect(ruoli.impostaPermessi).toHaveBeenCalledWith('housekeeper', ['chat.assistenza']);
    expect(avvisi.mostra).toHaveBeenCalledWith('gestionale.permessi.salvati', 'successo');
  });

  it("mostra l'errore del backend", async () => {
    ruoli.impostaPermessi.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: {
              errore: { codice: 'PERMESSO_SCONOSCIUTO', messaggio: 'Permessi inesistenti' },
            },
          }),
      ),
    );
    const { elemento, salva } = await crea();

    await salva();

    expect(elemento.querySelector('[role=alert]')?.textContent).toContain('Permessi inesistenti');
  });
});
