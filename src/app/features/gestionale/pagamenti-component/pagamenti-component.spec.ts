import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { PagamentiService } from '../../../core/services/pagamenti/pagamenti-service';
import { PagamentiComponent } from './pagamenti-component';

describe('PagamentiComponent', () => {
  const pagamenti = { elencaPagamenti: vi.fn() };
  const pagina = {
    elementi: [
      {
        id: 1,
        prenotazione_id: 7,
        tipo: 'saldo',
        metodo: 'contanti',
        stato: 'completato',
        importo: 120,
        pagato_il: null,
        creato_il: '2030-06-01T10:00:00Z',
      },
    ],
    totale: 1,
    pagina: 1,
    perPagina: 10,
    pagine: 1,
  };
  const tutti = { dal: undefined, al: undefined, stato: [], metodo: [], tipo: [] };

  beforeEach(() => {
    pagamenti.elencaPagamenti.mockReset();
    pagamenti.elencaPagamenti.mockReturnValue(of(pagina));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: PagamentiService, useValue: pagamenti },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(PagamentiComponent);
    await fixture.whenStable();
    const elemento = fixture.nativeElement as HTMLElement;
    const imposta = async (selettore: string, valore: string, evento = 'change') => {
      const campo = elemento.querySelector<HTMLInputElement>(`form[role=search] ${selettore}`)!;
      campo.value = valore;
      campo.dispatchEvent(new Event(evento));
      await fixture.whenStable();
    };
    return { elemento, imposta };
  }

  it('parte da tutti i movimenti, i più recenti in cima', async () => {
    const { elemento } = await crea();

    expect(pagamenti.elencaPagamenti).toHaveBeenCalledWith({ ...tutti, pagina: 1, perPagina: 10 });
    expect(elemento.querySelectorAll('app-riga-pagamento')).toHaveLength(1);
  });

  it('filtra per periodo, con il giorno «al» compreso, e per stato', async () => {
    const { imposta } = await crea();

    await imposta('input[formControlName=dal]', '2030-06-01', 'input');
    await imposta('input[formControlName=al]', '2030-06-30', 'input');
    await imposta('select[formControlName=stato]', 'annullato');

    expect(pagamenti.elencaPagamenti).toHaveBeenLastCalledWith({
      ...tutti,
      dal: '2030-06-01',
      al: '2030-07-01',
      stato: ['annullato'],
      pagina: 1,
      perPagina: 10,
    });
  });

  it('mostra l errore se l elenco non arriva', async () => {
    pagamenti.elencaPagamenti.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500, error: {} })),
    );
    const { elemento } = await crea();

    expect(elemento.querySelector('[role=alert]')).not.toBeNull();
  });
});
