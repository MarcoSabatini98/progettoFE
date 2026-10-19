import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { PulizieService } from '../../../core/services/pulizie/pulizie-service';
import { PERMESSI } from '../../../core/services/ruoli/ruoli-costanti';
import { AttivitaPuliziaInterface } from '../../../shared/models/attivita-pulizia/attivita-pulizia-model';
import { LavoroPuliziaComponent } from './lavoro-pulizia-component';

describe('LavoroPuliziaComponent', () => {
  const pulizie = { avanzaAttivita: vi.fn(), rinviaAttivita: vi.fn() };
  const auth = { haPermessi: vi.fn(), utente: () => ({ id: 3 }) };
  const attivita = {
    id: 9,
    assegnata_a: 3,
    stato: 'in_corso',
    note: null,
    checklist: [
      { voce: 'Bagno', fatto: true },
      { voce: 'Letti', fatto: false },
    ],
  } as unknown as AttivitaPuliziaInterface;

  beforeEach(() => {
    pulizie.avanzaAttivita.mockReset();
    pulizie.avanzaAttivita.mockReturnValue(of(attivita));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: PulizieService, useValue: pulizie },
        { provide: AuthService, useValue: auth },
      ],
    });
  });

  /** permessi: quelli concessi all'utente di prova. */
  async function crea(dati: Partial<AttivitaPuliziaInterface> = {}, permessi = ['esegui']) {
    auth.haPermessi.mockImplementation(([permesso]: string[]) =>
      permessi.some((nome) => permesso === `pulizie.${nome}`),
    );
    const fixture = TestBed.createComponent(LavoroPuliziaComponent);
    fixture.componentRef.setInput('attivita', { ...attivita, ...dati });
    await fixture.whenStable();
    return { fixture, elemento: fixture.nativeElement as HTMLElement };
  }

  function pulsanti(elemento: HTMLElement): string[] {
    return Array.from(elemento.querySelectorAll('button'), (b) => b.textContent!.trim());
  }

  it('spuntando una voce manda la checklist intera', async () => {
    const { fixture, elemento } = await crea();
    const aggiornata = vi.fn();
    fixture.componentInstance.aggiornata.subscribe(aggiornata);

    const [, letti] = elemento.querySelectorAll<HTMLInputElement>('input[type=checkbox]');
    letti.click();

    expect(pulizie.avanzaAttivita).toHaveBeenCalledWith(9, {
      checklist: [
        { voce: 'Bagno', fatto: true },
        { voce: 'Letti', fatto: true },
      ],
    });
    expect(aggiornata).toHaveBeenCalledWith(attivita);
  });

  it('all addetto propone di finire, rimettere da fare o rinviare', async () => {
    const { elemento } = await crea();

    expect(pulsanti(elemento)).toEqual([
      'gestionale.pulizie.passaggi.in_corso.completata',
      'gestionale.pulizie.passaggi.in_corso.da_fare',
      'gestionale.pulizie.rinvii.oggi',
      'gestionale.pulizie.rinvii.domani',
    ]);
    elemento.querySelector('button')!.click();
    expect(pulizie.avanzaAttivita).toHaveBeenCalledWith(9, { stato: 'completata' });
  });

  it('a pulizia finita l addetto non ha altro da fare', async () => {
    const { elemento } = await crea({ stato: 'completata' });

    expect(pulsanti(elemento)).toEqual([]);
  });

  it('chi gestisce verifica o respinge', async () => {
    const { elemento } = await crea({ stato: 'completata' }, ['esegui', 'gestisci']);

    expect(pulsanti(elemento)).toEqual([
      'gestionale.pulizie.passaggi.completata.verificata',
      'gestionale.pulizie.passaggi.completata.in_corso',
    ]);
  });

  it('l attività di un altro addetto è in sola lettura', async () => {
    const { elemento } = await crea({ assegnata_a: 8, note: 'Manca un asciugamano' });

    expect(elemento.querySelector('textarea')).toBeNull();
    expect(elemento.querySelector<HTMLInputElement>('input[type=checkbox]')?.disabled).toBe(true);
    expect(elemento.textContent).toContain('Manca un asciugamano');
  });

  it('salva le note e mostra il rifiuto del backend', async () => {
    pulizie.avanzaAttivita.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 422, error: {} })),
    );
    const { fixture, elemento } = await crea();
    const campo = elemento.querySelector('textarea')!;

    campo.value = 'Tenda rotta';
    campo.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    Array.from(elemento.querySelectorAll('button'))
      .find((pulsante) => pulsante.textContent!.includes('salvaNote'))!
      .click();
    fixture.detectChanges();

    expect(pulizie.avanzaAttivita).toHaveBeenCalledWith(9, { note: 'Tenda rotta' });
    expect(elemento.querySelector('[role=alert]')).not.toBeNull();
  });

  it('non disturbare: rinvia la camera e passa quella aggiornata', async () => {
    const libera = { ...attivita, stato: 'da_fare', assegnata_a: null };
    pulizie.rinviaAttivita.mockReturnValue(of(libera));
    const { fixture, elemento } = await crea();
    const aggiornata = vi.fn();
    fixture.componentInstance.aggiornata.subscribe(aggiornata);

    Array.from(elemento.querySelectorAll('button')).at(-1)!.click();

    expect(pulizie.rinviaAttivita).toHaveBeenCalledWith(9, 'domani');
    expect(aggiornata).toHaveBeenCalledWith(libera);
  });

  it('usa i permessi delle pulizie', async () => {
    await crea();

    expect(auth.haPermessi).toHaveBeenCalledWith([PERMESSI.PULIZIE_ESEGUI]);
  });
});
