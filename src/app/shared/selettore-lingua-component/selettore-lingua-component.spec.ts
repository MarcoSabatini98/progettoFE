import { provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ImpostazioniPubbliche } from '../../shared/models/impostazione/impostazione-model';
import { CHIAVI_IMPOSTAZIONI } from '../../core/services/impostazioni/impostazioni-costanti';
import { ImpostazioniService } from '../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../core/services/lingua/lingua-service';
import { SelettoreLinguaComponent } from './selettore-lingua-component';

describe('SelettoreLinguaComponent', () => {
  const pubbliche = signal<ImpostazioniPubbliche>({});

  beforeEach(() => {
    localStorage.clear();
    pubbliche.set({});
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [provideHttpClient(), { provide: ImpostazioniService, useValue: { pubbliche } }],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(SelettoreLinguaComponent);
    await fixture.whenStable();
    return fixture;
  }

  it('elenca solo le lingue attive con il loro nome', async () => {
    pubbliche.set({ [CHIAVI_IMPOSTAZIONI.lingueAttive]: ['it', 'en'] });
    const fixture = await crea();
    const opzioni: HTMLOptionElement[] = [...fixture.nativeElement.querySelectorAll('option')];

    expect(opzioni.map((o) => o.textContent?.trim())).toEqual(['Italiano', 'English']);
  });

  it('cambia la lingua del sito', async () => {
    const fixture = await crea();
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');

    select.value = 'fr';
    select.dispatchEvent(new Event('change'));

    expect(TestBed.inject(LinguaService).attiva()).toBe('fr');
  });

  it('sparisce se è attiva una sola lingua', async () => {
    pubbliche.set({ [CHIAVI_IMPOSTAZIONI.lingueAttive]: ['it'] });
    const fixture = await crea();

    expect(fixture.nativeElement.querySelector('select')).toBeNull();
  });
});
