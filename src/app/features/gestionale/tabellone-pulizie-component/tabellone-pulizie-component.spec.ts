import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { AttivitaPuliziaInterface } from '../../../shared/models/attivita-pulizia/attivita-pulizia-model';
import {
  ColonnaPulizieInterface,
  SpostamentoPuliziaInterface,
} from '../../../shared/models/colonna-pulizie/colonna-pulizie-model';
import { TabellonePulizieComponent } from './tabellone-pulizie-component';

describe('TabellonePulizieComponent', () => {
  const attivita = (id: number, stato: string) =>
    ({
      id,
      stato,
      tipo: 'riassetto',
      priorita: 'normale',
      checklist: [],
      camera: { numero: `10${id}` },
    }) as unknown as AttivitaPuliziaInterface;
  const da_fare = attivita(1, 'da_fare');
  const finita = attivita(2, 'verificata');
  const colonne: ColonnaPulizieInterface[] = [
    { chiave: 'da_fare', titolo: 'gestionale.pulizie.stati.da_fare', attivita: [da_fare] },
    { chiave: 'in_corso', titolo: 'gestionale.pulizie.stati.in_corso', attivita: [] },
    { chiave: 'verificata', titolo: 'gestionale.pulizie.stati.verificata', attivita: [finita] },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [provideRouter([])],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(TabellonePulizieComponent);
    fixture.componentRef.setInput('colonne', colonne);
    fixture.componentRef.setInput('destinazioni', (riga: AttivitaPuliziaInterface) =>
      riga.stato === 'da_fare' ? ['in_corso'] : [],
    );
    fixture.componentRef.setInput('azione', 'gestionale.pulizie.spostaIn');
    const spostamenti: SpostamentoPuliziaInterface[] = [];
    fixture.componentInstance.sposta.subscribe((spostamento) => spostamenti.push(spostamento));
    await fixture.whenStable();
    return {
      componente: fixture.componentInstance,
      elemento: fixture.nativeElement as HTMLElement,
      spostamenti,
    };
  }

  it('una colonna per chiave, vuote comprese, e il menu solo dove si può andare', async () => {
    const { elemento } = await crea();

    const sezioni = elemento.querySelectorAll('section');
    expect(sezioni).toHaveLength(3);
    expect(sezioni[1].textContent).toContain('gestionale.pulizie.vuoto');
    expect(elemento.querySelectorAll('select')).toHaveLength(1);
    expect(sezioni[2].querySelector('.attivita')!.classList).toContain('cdk-drag-disabled');
    const voci = Array.from(sezioni[0].querySelectorAll('option')).map((voce) => voce.value);
    expect(voci).toEqual(['', 'in_corso']);
  });

  it('dal menu sposta la camera e la voce torna vuota', async () => {
    const { elemento, spostamenti } = await crea();

    const menu = elemento.querySelector('select')!;
    menu.value = 'in_corso';
    menu.dispatchEvent(new Event('change'));

    expect(spostamenti).toEqual([{ attivita: da_fare, verso: 'in_corso' }]);
    expect(menu.value).toBe('');
  });

  it('trascinata in un altra colonna la sposta, nella stessa no', async () => {
    const { componente, spostamenti } = await crea();
    const lista = (data: string) => ({ data });
    const lascia = (da: string, a: string) =>
      componente.lascia({
        previousContainer: lista(da),
        container: lista(a),
        item: { data: da_fare },
      } as unknown as CdkDragDrop<string, string, AttivitaPuliziaInterface>);

    const stessa = lista('da_fare');
    componente.lascia({
      previousContainer: stessa,
      container: stessa,
      item: { data: da_fare },
    } as unknown as CdkDragDrop<string, string, AttivitaPuliziaInterface>);
    lascia('da_fare', 'in_corso');

    expect(spostamenti).toEqual([{ attivita: da_fare, verso: 'in_corso' }]);
  });
});
