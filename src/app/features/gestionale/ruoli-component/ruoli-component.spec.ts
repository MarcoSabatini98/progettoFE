import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { PermessiService } from '../../../core/services/permessi/permessi-service';
import { RuoliComponent } from './ruoli-component';

describe('RuoliComponent', () => {
  const ruoli = { leggiMatrice: vi.fn(), leggiRegoleChat: vi.fn() };
  const ruolo = (codice: string, staff = true) => ({
    codice,
    nome: codice,
    descrizione: null,
    staff,
    permessi: [],
  });
  const matrice = {
    permessi: [{ codice: 'pulizie.esegui', modulo: 'pulizie', descrizione: '' }],
    ruoli: [
      ruolo('admin'),
      ruolo('housekeeper'),
      ruolo('housekeeper_senior'),
      ruolo('receptionist'),
      ruolo('cliente', false),
    ],
  };

  beforeEach(() => {
    ruoli.leggiMatrice.mockReturnValue(of(matrice));
    ruoli.leggiRegoleChat.mockReturnValue(of([]));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: PermessiService, useValue: ruoli },
        { provide: AvvisiService, useValue: { mostra: vi.fn() } },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(RuoliComponent);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('modifica i permessi dei soli ruoli assegnabili e la chat dello staff', async () => {
    const elemento = await crea();

    expect(elemento.querySelectorAll('app-permessi-ruolo option')).toHaveLength(3);
    // 4 ruoli dello staff: 10 coppie, il cliente resta fuori.
    expect(elemento.querySelectorAll('app-regole-chat input[type=checkbox]')).toHaveLength(10);
  });

  it("mostra l'errore se i dati non arrivano", async () => {
    ruoli.leggiRegoleChat.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 403, error: {} })),
    );
    const elemento = await crea();

    expect(elemento.querySelector('[role=alert]')).not.toBeNull();
  });
});
