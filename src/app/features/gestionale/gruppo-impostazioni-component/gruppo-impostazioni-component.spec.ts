import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { ImpostazioneInterface } from '../../../shared/models/impostazione/impostazione-model';
import { GruppoImpostazioniComponent, campoImpostazione } from './gruppo-impostazioni-component';

function voce(
  chiave: string,
  valore: ImpostazioneInterface['valore'],
  tipo: ImpostazioneInterface['tipo'] = 'testo',
): ImpostazioneInterface {
  return {
    chiave,
    valore,
    tipo,
    gruppo: 'prova',
    descrizione: null,
    pubblica: true,
    aggiornato_da: null,
    aggiornato_il: '2030-06-01T10:00:00Z',
  };
}

describe('GruppoImpostazioniComponent', () => {
  const impostazioni = { aggiornaImpostazioni: vi.fn() };
  const avvisi = { mostra: vi.fn() };
  const voci = [
    voce('struttura_nome', 'Casa Mare'),
    voce('iva_soggiorno', 10, 'numero'),
    voce('pulizie_richiedi_ispezione', true, 'booleano'),
    voce('aspetto_colore', '#5e6b3a'),
    voce('aspetto_tema', 'sistema'),
    voce('lingue_attive', ['it', 'en'], 'json'),
  ];

  beforeEach(() => {
    impostazioni.aggiornaImpostazioni.mockReset();
    impostazioni.aggiornaImpostazioni.mockReturnValue(of([]));
    avvisi.mostra.mockReset();
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: ImpostazioniService, useValue: impostazioni },
        { provide: AvvisiService, useValue: avvisi },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(GruppoImpostazioniComponent);
    fixture.componentRef.setInput('gruppo', 'struttura');
    fixture.componentRef.setInput('voci', voci);
    await fixture.whenStable();
    const elemento = fixture.nativeElement as HTMLElement;
    const salva = async () => {
      elemento.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { fixture, elemento, salva };
  }

  it('un controllo per voce, scelto da chiave e tipo', async () => {
    const { elemento } = await crea();

    expect(elemento.textContent).toContain('gestionale.impostazioni.gruppi.struttura');
    expect(elemento.querySelector<HTMLInputElement>('input[type=text]')?.value).toBe('Casa Mare');
    expect(elemento.querySelector<HTMLInputElement>('input[type=number]')?.value).toBe('10');
    expect(elemento.querySelector<HTMLInputElement>('input[type=color]')?.value).toBe('#5e6b3a');
    expect(elemento.querySelector<HTMLSelectElement>('select')?.value).toBe('sistema');
    const spunte = [...elemento.querySelectorAll<HTMLInputElement>('input[type=checkbox]')];
    expect(spunte.map((spunta) => spunta.checked)).toEqual([true, true, true, false, false, false]);
  });

  it('salva le sole impostazioni cambiate, lingue nel loro ordine', async () => {
    const { fixture, elemento, salva } = await crea();
    const nome = elemento.querySelector<HTMLInputElement>('input[type=text]')!;
    nome.value = 'Casa Sole';
    nome.dispatchEvent(new Event('input'));
    const lingue = [...elemento.querySelectorAll<HTMLInputElement>('fieldset input')];
    lingue[0].click();
    lingue[3].click();
    lingue[0].click();
    await fixture.whenStable();
    const salvate = vi.fn();
    fixture.componentInstance.salvate.subscribe(salvate);

    await salva();

    expect(impostazioni.aggiornaImpostazioni).toHaveBeenCalledWith({
      struttura_nome: 'Casa Sole',
      lingue_attive: ['it', 'en', 'de'],
    });
    expect(avvisi.mostra).toHaveBeenCalledWith('gestionale.impostazioni.salvate', 'successo');
    expect(salvate).toHaveBeenCalled();

    // Dopo il salvataggio niente è più da salvare.
    await salva();
    expect(impostazioni.aggiornaImpostazioni).toHaveBeenCalledTimes(1);
  });

  it('un testo svuotato si salva vuoto', async () => {
    const { elemento, salva } = await crea();
    const nome = elemento.querySelector<HTMLInputElement>('input[type=text]')!;
    nome.value = '';
    nome.dispatchEvent(new Event('input'));

    await salva();

    expect(impostazioni.aggiornaImpostazioni).toHaveBeenCalledWith({ struttura_nome: null });
  });

  it('mostra il motivo se il server rifiuta', async () => {
    impostazioni.aggiornaImpostazioni.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { errore: { codice: 'IMPOSTAZIONE_NON_VALIDA', messaggio: 'No' } },
          }),
      ),
    );
    const { fixture, elemento, salva } = await crea();
    elemento.querySelector<HTMLInputElement>('input[type=checkbox]')!.click();
    await fixture.whenStable();

    await salva();

    expect(elemento.querySelector('[role=alert]')).not.toBeNull();
  });
});

describe('campoImpostazione', () => {
  it('controllo apposito per le chiavi note, altrimenti dal tipo', () => {
    expect(campoImpostazione(voce('orario_checkin', '15:00'))).toBe('orario');
    expect(campoImpostazione(voce('lingua_predefinita', 'it'))).toBe('lingua');
    expect(campoImpostazione(voce('pulizie_autoassegna', false, 'booleano'))).toBe('spunta');
    expect(campoImpostazione(voce('limite_contanti', 5000, 'numero'))).toBe('numero');
    expect(campoImpostazione(voce('valuta', 'EUR'))).toBe('testo');
  });
});
