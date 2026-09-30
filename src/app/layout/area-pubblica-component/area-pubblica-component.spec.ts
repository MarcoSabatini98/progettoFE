import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { AuthService } from '../../core/services/auth/auth-service';
import { CHIAVI_IMPOSTAZIONI } from '../../core/services/impostazioni/impostazioni-costanti';
import { ImpostazioniService } from '../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../core/services/lingua/configura-transloco-test';
import { AreaPubblicaComponent } from './area-pubblica-component';

describe('AreaPubblicaComponent', () => {
  const impostazioni: Record<string, string> = {
    [CHIAVI_IMPOSTAZIONI.nome]: 'Casa del Mare',
    [CHIAVI_IMPOSTAZIONI.indirizzo]: 'Via Roma 1',
    [CHIAVI_IMPOSTAZIONI.cap]: '07100',
    [CHIAVI_IMPOSTAZIONI.comune]: 'Sassari',
    [CHIAVI_IMPOSTAZIONI.provincia]: 'SS',
    [CHIAVI_IMPOSTAZIONI.email]: 'info@example.com',
    [CHIAVI_IMPOSTAZIONI.cin]: 'IT090064C2000000001',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        {
          provide: ImpostazioniService,
          useValue: {
            pubbliche: signal({}),
            testo: (chiave: string) => impostazioni[chiave] ?? '',
          },
        },
        { provide: AuthService, useValue: { collegato: signal(false), utente: signal(null) } },
      ],
    });
  });

  async function crea() {
    const fixture = TestBed.createComponent(AreaPubblicaComponent);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('applica i token dell’area pubblica', async () => {
    expect((await crea()).classList).toContain('area-pubblica');
  });

  it('mostra marchio e dati obbligatori della struttura', async () => {
    const elemento = await crea();

    expect(elemento.querySelector('.marchio')?.textContent).toContain('CD');
    expect(elemento.querySelector('.piede')?.textContent).toContain(
      'Via Roma 1, 07100 Sassari (SS)',
    );
    expect(elemento.querySelector('.piede-cin')?.textContent).toContain('IT090064C2000000001');
    expect(elemento.querySelector('a[href="mailto:info@example.com"]')).not.toBeNull();
  });

  it('senza sessione offre il pulsante di accesso', async () => {
    const elemento = await crea();

    expect(elemento.querySelector('a[href="/accesso"]')).not.toBeNull();
    expect(elemento.querySelector('app-menu-utente')).toBeNull();
  });
});
