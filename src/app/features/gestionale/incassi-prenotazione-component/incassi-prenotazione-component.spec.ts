import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { PagamentiService } from '../../../core/services/pagamenti/pagamenti-service';
import { PrenotazioneInterface } from '../../../shared/models/prenotazione/prenotazione-model';
import { IncassiPrenotazioneComponent } from './incassi-prenotazione-component';

describe('IncassiPrenotazioneComponent', () => {
  const pagamenti = {
    elencaPagamentiPrenotazione: vi.fn(),
    leggiRiepilogo: vi.fn(),
    registraPagamento: vi.fn(),
    avviaOnline: vi.fn(),
  };
  const auth = { haPermessi: vi.fn() };

  beforeEach(() => {
    [...Object.values(pagamenti), auth.haPermessi].forEach((spia) => spia.mockReset());
    pagamenti.elencaPagamentiPrenotazione.mockReturnValue(
      of([
        {
          id: 1,
          tipo: 'acconto',
          metodo: 'stripe',
          stato: 'completato',
          importo: 90,
          pagato_il: '2030-06-01T10:00:00.000Z',
          creato_il: '2030-06-01T10:00:00.000Z',
          documento_fiscale: null,
        },
        {
          id: 2,
          tipo: 'rimborso',
          metodo: 'stripe',
          stato: 'in_attesa',
          importo: 20,
          pagato_il: null,
          creato_il: '2030-06-02T10:00:00.000Z',
          documento_fiscale: null,
        },
      ]),
    );
    pagamenti.leggiRiepilogo.mockReturnValue(of({ da_pagare_ora: 210, metodi_online: ['stripe'] }));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: PagamentiService, useValue: pagamenti },
        { provide: AuthService, useValue: auth },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  async function crea(registra: boolean) {
    auth.haPermessi.mockReturnValue(registra);
    const fixture = TestBed.createComponent(IncassiPrenotazioneComponent);
    fixture.componentRef.setInput('prenotazione', { id: 7 } as PrenotazioneInterface);
    await fixture.whenStable();
    return { fixture, elemento: fixture.nativeElement as HTMLElement };
  }

  it('elenca i movimenti, con i rimborsi in uscita e gli stati non completati', async () => {
    const { elemento } = await crea(false);

    const righe = elemento.querySelectorAll('.movimenti > li');
    expect(pagamenti.elencaPagamentiPrenotazione).toHaveBeenCalledWith(7);
    expect(righe).toHaveLength(2);
    expect(righe[0].textContent).toContain('gestionale.tipiPagamento.acconto');
    expect(righe[1].classList).toContain('uscita');
    expect(righe[1].textContent).toContain('gestionale.statiPagamento.in_attesa');
  });

  it('senza il permesso di registrare non propone incassi né link', async () => {
    const { elemento } = await crea(false);

    expect(elemento.querySelector('app-registra-incasso')).toBeNull();
    expect(elemento.querySelector('app-link-pagamento')).toBeNull();
  });

  it('un incasso registrato avvisa chi mostra la prenotazione', async () => {
    pagamenti.registraPagamento.mockReturnValue(of({}));
    const { fixture, elemento } = await crea(true);
    const aggiornata = vi.fn();
    fixture.componentInstance.aggiornata.subscribe(aggiornata);

    elemento.querySelector<HTMLElement>('app-registra-incasso button')?.click();
    await fixture.whenStable();
    elemento.querySelector('app-registra-incasso form')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(pagamenti.registraPagamento).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ importo: 210 }),
    );
    expect(aggiornata).toHaveBeenCalled();
  });
});
