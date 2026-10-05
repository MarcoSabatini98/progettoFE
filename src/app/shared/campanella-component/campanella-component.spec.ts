import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AvvisiService } from '../../core/services/avvisi/avvisi-service';
import { LinguaService } from '../../core/services/lingua/lingua-service';
import { traduzioniTest } from '../../core/services/lingua/configura-transloco-test';
import { NotificheService } from '../../core/services/notifiche/notifiche-service';
import { SocketService } from '../../core/services/socket/socket-service';
import { NotificaInterface } from '../models/notifica/notifica-model';
import { CampanellaComponent } from './campanella-component';

describe('CampanellaComponent', () => {
  const notifica = (id: number, letta_il: string | null = null): NotificaInterface => ({
    id,
    utente_id: 1,
    tipo: 'pulizia',
    priorita: 'info',
    codice: 'camera_da_ispezionare',
    parametri: { camera: '101' },
    titolo: 'Camera 101 da ispezionare',
    testo: null,
    link: `/staff/pulizie/${id}`,
    letta_il,
    creato_il: '2026-10-05T10:00:00.000Z',
  });
  let arrivi: Subject<NotificaInterface>;
  let notificheService: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    arrivi = new Subject();
    notificheService = {
      elencaNotifiche: vi.fn(() =>
        of({
          elementi: [notifica(1), notifica(2, '2026-10-04T10:00:00.000Z')],
          totale: 2,
          pagina: 1,
          perPagina: 20,
          pagine: 1,
          non_lette: 1,
        }),
      ),
      segnaLetta: vi.fn((id: number) => of(notifica(id, '2026-10-05T11:00:00.000Z'))),
      segnaTutteLette: vi.fn(() => of(1)),
      eliminaNotifica: vi.fn(() => of(null)),
    };
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: NotificheService, useValue: notificheService },
        { provide: SocketService, useValue: { ascolta: () => arrivi.asObservable() } },
        { provide: AvvisiService, useValue: { mostra: vi.fn() } },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(CampanellaComponent);
    await fixture.whenStable();
    return fixture;
  }

  const contatore = (elemento: HTMLElement) => elemento.querySelector('.contatore')?.textContent;

  it('mostra le ultime notifiche con il contatore delle non lette', async () => {
    const elemento: HTMLElement = (await crea()).nativeElement;

    expect(notificheService['elencaNotifiche']).toHaveBeenCalledWith({ perPagina: 20 });
    expect(elemento.querySelectorAll('.notifica')).toHaveLength(2);
    expect(elemento.querySelectorAll('.non-letta')).toHaveLength(1);
    expect(contatore(elemento)).toContain('1');
    expect(elemento.querySelector('.notifica-titolo')?.textContent).toContain(
      'notifiche.codici.camera_da_ispezionare',
    );
  });

  it('aggiunge in cima le notifiche arrivate dal socket', async () => {
    const fixture = await crea();

    arrivi.next(notifica(3));
    await fixture.whenStable();

    const elemento: HTMLElement = fixture.nativeElement;
    expect(elemento.querySelectorAll('.notifica')).toHaveLength(3);
    expect(contatore(elemento)).toContain('2');
  });

  it('al clic segna letta la notifica e apre il suo link', async () => {
    const fixture = await crea();
    const naviga = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const elemento: HTMLElement = fixture.nativeElement;
    const chiudi = vi.fn();
    Object.assign(elemento.querySelector('.pannello')!, {
      matches: () => true,
      hidePopover: chiudi,
    });

    elemento.querySelector<HTMLButtonElement>('.notifica-apri')!.click();
    await fixture.whenStable();

    expect(notificheService['segnaLetta']).toHaveBeenCalledWith(1);
    expect(naviga).toHaveBeenCalledWith('/staff/pulizie/1');
    expect(chiudi).toHaveBeenCalled();
    expect(elemento.querySelector('.contatore')).toBeNull();
  });

  it('segna tutte lette e nasconde il contatore', async () => {
    const fixture = await crea();
    const elemento: HTMLElement = fixture.nativeElement;

    elemento.querySelector<HTMLButtonElement>('.pannello-intestazione button')!.click();
    await fixture.whenStable();

    expect(notificheService['segnaTutteLette']).toHaveBeenCalled();
    expect(elemento.querySelectorAll('.non-letta')).toHaveLength(0);
    expect(elemento.querySelector('.contatore')).toBeNull();
  });

  it('elimina una notifica dalla campanella', async () => {
    const fixture = await crea();
    const elemento: HTMLElement = fixture.nativeElement;

    elemento.querySelector<HTMLButtonElement>('.notifica .pulsante-icona')!.click();
    await fixture.whenStable();

    expect(notificheService['eliminaNotifica']).toHaveBeenCalledWith(1);
    expect(elemento.querySelectorAll('.notifica')).toHaveLength(1);
    expect(elemento.querySelector('.contatore')).toBeNull();
  });

  it("se l'elenco non arriva mostra l'errore senza contatore", async () => {
    notificheService['elencaNotifiche'].mockReturnValue(throwError(() => new Error('rete')));
    const elemento: HTMLElement = (await crea()).nativeElement;

    expect(elemento.querySelector('.esito-errore')).not.toBeNull();
    expect(elemento.querySelector('.contatore')).toBeNull();
  });
});
