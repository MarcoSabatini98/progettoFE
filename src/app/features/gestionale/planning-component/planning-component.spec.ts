import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { CalendariService } from '../../../core/services/calendari/calendari-service';
import { CamereService } from '../../../core/services/camere/camere-service';
import { dataCalendario, spostaData } from '../../../core/services/disponibilita/date-soggiorno';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { PrenotazioniService } from '../../../core/services/prenotazioni/prenotazioni-service';
import { BarraPlanningInterface } from '../../../shared/models/barra-planning/barra-planning-model';
import { CameraInterface } from '../../../shared/models/camera/camera-model';
import { DataBloccataInterface } from '../../../shared/models/data-bloccata/data-bloccata-model';
import { PlanningComponent } from './planning-component';

describe('PlanningComponent', () => {
  const oggi = dataCalendario(new Date());
  const tra = (giorni: number) => spostaData(oggi, giorni);
  const soggiorno = {
    id: 7,
    codice: 'BB-7',
    stato: 'confermata',
    data_arrivo: tra(1),
    data_partenza: tra(3),
    titolare: { nome: 'Anna', cognome: 'Rossi' },
  };
  const camere = [
    { id: 1, numero: '101', prenotazioni: [soggiorno], date_bloccate: [] },
    { id: 2, numero: '102', prenotazioni: [], date_bloccate: [] },
  ] as unknown as CameraInterface[];
  const chiusura = {
    id: 5,
    camera_id: null,
    data_inizio: tra(5),
    data_fine: tra(6),
    motivo: 'Ferie',
    origine: 'manuale',
  } as DataBloccataInterface;
  let camereService: { leggiPlanning: ReturnType<typeof vi.fn> };
  let prenotazioni: { aggiornaPrenotazione: ReturnType<typeof vi.fn> };
  let avvisi: { mostra: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
    camereService = { leggiPlanning: vi.fn(() => of(camere)) };
    prenotazioni = { aggiornaPrenotazione: vi.fn(() => of({})) };
    avvisi = { mostra: vi.fn() };
  });

  async function crea(permesso = true) {
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: CamereService, useValue: camereService },
        { provide: CalendariService, useValue: { elencaChiusure: () => of([chiusura]) } },
        { provide: PrenotazioniService, useValue: prenotazioni },
        { provide: AvvisiService, useValue: avvisi },
        { provide: AuthService, useValue: { haPermessi: () => permesso } },
      ],
    });
    const fixture = TestBed.createComponent(PlanningComponent);
    await fixture.whenStable();
    const elemento = fixture.nativeElement as HTMLElement;
    const pulsante = (testo: string) =>
      Array.from(elemento.querySelectorAll('button')).find((voce) =>
        voce.textContent!.includes(testo),
      )!;
    return { fixture, componente: fixture.componentInstance, elemento, pulsante };
  }

  it('una riga per camera con i soggiorni sui loro giorni e la struttura chiusa', async () => {
    const { elemento } = await crea();

    expect(camereService.leggiPlanning).toHaveBeenCalledWith({ dal: oggi, al: tra(30) });
    expect(elemento.querySelectorAll('.giorno')).toHaveLength(30);
    const barra = elemento.querySelector<HTMLElement>('a.barra')!;
    expect(barra.dataset['stato']).toBe('confermata');
    expect(barra.style.gridColumn).toBe('3 / 5');
    expect(barra.textContent).toContain('Rossi');
    expect(elemento.querySelector('button.barra.chiusura')!.textContent).toContain('Ferie');
  });

  it('le frecce spostano il periodo di quanti giorni si vedono', async () => {
    const { fixture, elemento } = await crea();

    elemento
      .querySelector<HTMLButtonElement>('[aria-label="gestionale.planning.successivo"]')!
      .click();
    await fixture.whenStable();

    expect(camereService.leggiPlanning).toHaveBeenLastCalledWith({ dal: tra(30), al: tra(60) });
  });

  it('trascinato su un altra camera e un giorno dopo chiede conferma e poi salva', async () => {
    const { fixture, componente, elemento, pulsante } = await crea();
    const barra: BarraPlanningInterface = {
      da: 2,
      a: 4,
      prima: false,
      dopo: false,
      prenotazione: soggiorno as never,
    };
    componente.lascia({
      item: { data: barra, element: { nativeElement: { offsetWidth: 88 } } },
      distance: { x: 50, y: 40 },
      previousContainer: { data: camere[0] },
      container: { data: camere[1] },
    } as unknown as CdkDragDrop<CameraInterface, CameraInterface, BarraPlanningInterface>);
    await fixture.whenStable();

    expect(elemento.querySelector('.esito-avviso')!.textContent).toContain(
      'gestionale.planning.proposta',
    );
    pulsante('gestionale.planning.sposta').click();
    await fixture.whenStable();

    expect(prenotazioni.aggiornaPrenotazione).toHaveBeenCalledWith(7, {
      camera_id: 2,
      data_arrivo: tra(2),
      data_partenza: tra(4),
    });
    expect(avvisi.mostra).toHaveBeenCalledWith(expect.any(String), 'successo');
    expect(camereService.leggiPlanning).toHaveBeenCalledTimes(2);
    expect(elemento.querySelector('.esito-avviso')).toBeNull();
  });

  it('lasciato dove era non propone niente', async () => {
    const { componente, elemento } = await crea();

    componente.lascia({
      item: {
        data: { da: 2, a: 4, prima: false, dopo: false, prenotazione: soggiorno as never },
        element: { nativeElement: { offsetWidth: 88 } },
      },
      distance: { x: 10, y: 0 },
      previousContainer: { data: camere[0] },
      container: { data: camere[0] },
    } as unknown as CdkDragDrop<CameraInterface, CameraInterface, BarraPlanningInterface>);

    expect(elemento.querySelector('.esito-avviso')).toBeNull();
  });

  it('una chiusura cliccata si apre nel modulo', async () => {
    const { fixture, elemento } = await crea();

    elemento.querySelector<HTMLButtonElement>('button.barra.chiusura')!.click();
    await fixture.whenStable();

    expect(elemento.querySelector('app-chiusura h2')!.textContent).toContain(
      'gestionale.planning.modificaChiusura',
    );
  });

  it('senza permessi si guarda soltanto', async () => {
    const { elemento } = await crea(false);

    expect(elemento.querySelector('a.barra')!.classList).toContain('cdk-drag-disabled');
    expect(elemento.querySelector('app-chiusura')).toBeNull();
    expect(elemento.querySelector('button.barra')).toBeNull();
    expect(elemento.textContent).not.toContain('gestionale.planning.nuova');
  });
});
