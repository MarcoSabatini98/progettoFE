import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import {
  MENU_PORTALE,
  PERCORSI_PORTALE,
} from '../../../core/services/navigazione/navigazione-costanti';
import { AreaPersonaleComponent } from './area-personale-component';

describe('AreaPersonaleComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([{ path: '**', children: [] }]),
        { provide: AuthService, useValue: { utente: signal({ nome: 'Anna' }) } },
      ],
    });
  });

  it('mostra una scheda per sezione ed evidenzia quella aperta', async () => {
    await TestBed.inject(Router).navigateByUrl(PERCORSI_PORTALE.fatture);
    const fixture = TestBed.createComponent(AreaPersonaleComponent);
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;

    const schede = [...elemento.querySelectorAll('.scheda-link')];
    expect(schede.map((scheda) => scheda.getAttribute('href'))).toEqual(
      MENU_PORTALE.map((voce) => voce.percorso),
    );
    expect(elemento.querySelector('[aria-current="page"]')?.getAttribute('href')).toBe(
      PERCORSI_PORTALE.fatture,
    );
    expect(elemento.querySelector('router-outlet')).not.toBeNull();
  });
});
