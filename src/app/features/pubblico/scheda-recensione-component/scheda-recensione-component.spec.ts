import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { RecensionePubblicaInterface } from '../../../shared/models/recensione/recensione-model';
import { SchedaRecensioneComponent } from './scheda-recensione-component';

describe('SchedaRecensioneComponent', () => {
  const recensione = {
    id: 1,
    voto: 5,
    titolo: 'Splendido',
    commento: 'Torneremo.',
    autore: 'Anna B.',
    paese: 'DE',
    risposta: 'Grazie Anna!',
    creato_il: '2026-09-12T10:00:00.000Z',
  } as RecensionePubblicaInterface;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => 'Casa del Mare' } },
      ],
    });
  });

  async function crea(valore: RecensionePubblicaInterface) {
    const fixture = TestBed.createComponent(SchedaRecensioneComponent);
    fixture.componentRef.setInput('recensione', valore);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('mostra voto, testo, firma con paese e mese, risposta della struttura', async () => {
    const elemento = await crea(recensione);

    const firma = elemento.querySelector('.firma')?.textContent;
    expect(elemento.querySelector('.voto')?.textContent).toContain('5/5');
    expect(elemento.querySelector('h3')?.textContent).toBe('Splendido');
    expect(firma).toContain('Anna B.');
    expect(firma).toContain('Germania');
    expect(firma).toContain('settembre 2026');
    expect(elemento.querySelector('.risposta')?.textContent).toContain('Grazie Anna!');
  });

  it('anonima: niente nome né paese', async () => {
    const elemento = await crea({ ...recensione, autore: null, paese: null, risposta: null });

    expect(elemento.querySelector('.firma')?.textContent).toContain('recensioni.anonima');
    expect(elemento.querySelectorAll('.firma span')).toHaveLength(1);
    expect(elemento.querySelector('.risposta')).toBeNull();
  });
});
