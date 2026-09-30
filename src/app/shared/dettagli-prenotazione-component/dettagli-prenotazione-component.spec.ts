import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { traduzioniTest } from '../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../core/services/lingua/lingua-service';
import { PrenotazioneInterface } from '../models/prenotazione/prenotazione-model';
import { DettagliPrenotazioneComponent } from './dettagli-prenotazione-component';

describe('DettagliPrenotazioneComponent', () => {
  const prenotazione = {
    stato: 'in_attesa',
    data_arrivo: '2030-07-01',
    data_partenza: '2030-07-04',
    adulti: 2,
    bambini: 1,
    scade_il: '2030-06-30T10:15:00',
    camera: { tipologia: { nome: 'Doppia' } },
  } as unknown as PrenotazioneInterface;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [{ provide: LinguaService, useValue: { attiva: () => 'it' } }],
    });
  });

  async function crea(dati: PrenotazioneInterface) {
    const fixture = TestBed.createComponent(DettagliPrenotazioneComponent);
    fixture.componentRef.setInput('prenotazione', dati);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('mostra stato, camera e scadenza del pagamento', async () => {
    const elemento = await crea(prenotazione);

    expect(elemento.querySelector('.stato-prenotazione')?.getAttribute('data-stato')).toBe(
      'in_attesa',
    );
    expect(elemento.querySelector('.dati')?.textContent).toContain('Doppia');
    expect(elemento.querySelector('.scadenza')).not.toBeNull();
  });

  it('confermata non mostra la scadenza', async () => {
    const elemento = await crea({ ...prenotazione, stato: 'confermata' });

    expect(elemento.querySelector('.scadenza')).toBeNull();
  });
});
