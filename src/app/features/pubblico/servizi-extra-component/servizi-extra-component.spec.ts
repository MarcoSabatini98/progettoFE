import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CamereService } from '../../../core/services/camere/camere-service';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { ServizioInterface } from '../../../shared/models/servizio/servizio-model';
import { ServiziExtraComponent } from './servizi-extra-component';

describe('ServiziExtraComponent', () => {
  const camere = { elencaExtraPubblici: vi.fn() };
  const colazione = {
    id: 3,
    nome: 'Colazione',
    descrizione: 'Dolce e salata',
    icona: null,
    prezzo: 12,
    calcolo_prezzo: 'a_persona_notte',
  } as ServizioInterface;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: CamereService, useValue: camere },
        { provide: LinguaService, useValue: { attiva: () => 'it' } },
        { provide: ImpostazioniService, useValue: { testo: () => '' } },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(ServiziExtraComponent);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('una scheda per extra, con descrizione e modo di calcolo del prezzo', async () => {
    camere.elencaExtraPubblici.mockReturnValue(of([colazione]));

    const elemento = await crea();

    expect(elemento.querySelector('.griglia-extra h3')?.textContent).toBe('Colazione');
    expect(elemento.querySelector('.servizio-descrizione')?.textContent).toBe('Dolce e salata');
    expect(elemento.querySelector('.servizio-prezzo')?.textContent).toContain(
      'camere.calcolo.a_persona_notte',
    );
  });

  it('senza extra non mostra niente', async () => {
    camere.elencaExtraPubblici.mockReturnValue(of([]));

    const elemento = await crea();

    expect(elemento.querySelector('section')).toBeNull();
  });
});
