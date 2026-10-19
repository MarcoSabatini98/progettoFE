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
  const ruolo = (codice: string, permessi: string[]) => ({
    codice,
    nome: codice,
    descrizione: null,
    staff: true,
    permessi,
  });
  const ruoliModificabili = [
    ruolo('housekeeper', ['pulizie.leggi']),
    ruolo('receptionist', ['chat.assistenza', 'pulizie.esegui']),
  ];

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
    fixture.componentRef.setInput('ruoli', ruoliModificabili);
    fixture.componentRef.setInput('catalogo', catalogo);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const caselle = () => [...elemento.querySelectorAll<HTMLInputElement>('input[type=checkbox]')];
    const salva = async () => {
      elemento.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    const scegli = async (codice: string) => {
      const select = elemento.querySelector('select')!;
      select.value = codice;
      select.dispatchEvent(new Event('change'));
      await fixture.whenStable();
    };
    return { elemento, caselle, salva, scegli };
  }

  it('raggruppa i permessi per modulo e spunta quelli del ruolo', async () => {
    const { elemento, caselle } = await crea();

    expect(elemento.querySelectorAll('legend')).toHaveLength(2);
    expect(caselle().map((casella) => casella.checked)).toEqual([true, false, false]);
  });

  it('scegliendo il ruolo spunta i permessi che ha', async () => {
    const { elemento, caselle, scegli } = await crea();

    expect(elemento.querySelectorAll('option')).toHaveLength(2);
    await scegli('receptionist');

    expect(caselle().map((casella) => casella.checked)).toEqual([false, true, true]);
  });

  it('dopo il salvataggio, tornando sul ruolo, si vedono i permessi salvati', async () => {
    ruoli.impostaPermessi.mockReturnValue(of(['chat.assistenza']));
    const { caselle, salva, scegli } = await crea();

    caselle()[0].click();
    caselle()[2].click();
    await salva();
    await scegli('receptionist');
    await scegli('housekeeper');

    expect(caselle().map((casella) => casella.checked)).toEqual([false, false, true]);
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
