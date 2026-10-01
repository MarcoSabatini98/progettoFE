import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { CamereService } from '../../../core/services/camere/camere-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { DatiTipologiaComponent } from './dati-tipologia-component';

describe('DatiTipologiaComponent', () => {
  const camere = { aggiornaTipologia: vi.fn(), elencaServizi: vi.fn() };
  const avvisi = { mostra: vi.fn() };
  const doppia = {
    id: 2,
    nome: 'Doppia',
    prezzo_base: '90.00',
    ospiti_max: 2,
    superficie_mq: null,
    letti: null,
    descrizione: 'Vista mare',
    ordine: 0,
    attiva: true,
    servizi: [{ id: 1, nome: 'Wi-Fi' }],
  };

  beforeEach(() => {
    Object.values(camere).forEach((spia) => spia.mockReset());
    camere.elencaServizi.mockReturnValue(of([{ id: 1, nome: 'Wi-Fi', icona: null }]));
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: CamereService, useValue: camere },
        { provide: AvvisiService, useValue: avvisi },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(DatiTipologiaComponent);
    fixture.componentRef.setInput('tipologia', doppia);
    const salvata = vi.fn();
    fixture.componentInstance.salvata.subscribe(salvata);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const campo = (nome: string) =>
      elemento.querySelector<HTMLInputElement>(`[formControlName="${nome}"]`)!;
    const salva = async () => {
      elemento.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    return { campo, salva, salvata, elemento };
  }

  it('compila il modulo con i dati, il prezzo come numero e le dotazioni incluse', async () => {
    const { campo, elemento } = await crea();

    expect(campo('nome').value).toBe('Doppia');
    expect(campo('prezzo_base').value).toBe('90');
    expect(campo('letti').value).toBe('');
    expect(elemento.querySelector<HTMLInputElement>('app-scelta-dotazioni input')!.checked).toBe(
      true,
    );
  });

  it('salva i soli campi cambiati, il testo svuotato come null', async () => {
    const aggiornata = { ...doppia, descrizione: null };
    camere.aggiornaTipologia.mockReturnValue(of(aggiornata));
    const { campo, salva, salvata } = await crea();

    campo('descrizione').value = '';
    campo('descrizione').dispatchEvent(new Event('input'));
    await salva();

    expect(camere.aggiornaTipologia).toHaveBeenCalledWith(2, { descrizione: null });
    expect(avvisi.mostra).toHaveBeenCalledWith('gestionale.camere.salvata', 'successo');
    expect(salvata).toHaveBeenCalledWith(aggiornata);
  });

  it('senza modifiche o con dati non validi non chiama il backend', async () => {
    const { campo, salva } = await crea();

    await salva();
    campo('ospiti_max').value = '0';
    campo('ospiti_max').dispatchEvent(new Event('input'));
    await salva();

    expect(camere.aggiornaTipologia).not.toHaveBeenCalled();
  });
});
