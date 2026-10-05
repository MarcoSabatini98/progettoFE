import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NEVER, of } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';

import { AuthService } from '../../core/services/auth/auth-service';
import { CHIAVI_IMPOSTAZIONI } from '../../core/services/impostazioni/impostazioni-costanti';
import { ImpostazioniService } from '../../core/services/impostazioni/impostazioni-service';
import { MENU_PUBBLICO } from '../../core/services/navigazione/navigazione-costanti';
import { traduzioniTest } from '../../core/services/lingua/configura-transloco-test';
import { NotificheService } from '../../core/services/notifiche/notifiche-service';
import { SocketService } from '../../core/services/socket/socket-service';
import { AreaPubblicaComponent } from './area-pubblica-component';

describe('AreaPubblicaComponent', () => {
  const impostazioni: Record<string, string> = {
    [CHIAVI_IMPOSTAZIONI.nome]: 'Casa del Mare',
    [CHIAVI_IMPOSTAZIONI.email]: 'info@example.com',
    [CHIAVI_IMPOSTAZIONI.cin]: 'IT090064C2000000001',
  };

  const collegato = signal(false);

  beforeEach(() => {
    collegato.set(false);
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        {
          provide: ImpostazioniService,
          useValue: {
            pubbliche: signal({}),
            testo: (chiave: string) => impostazioni[chiave] ?? '',
            indirizzo: signal('Via Roma 1, 07100 Sassari (SS)'),
          },
        },
        { provide: AuthService, useValue: { collegato, utente: signal(null) } },
        {
          provide: NotificheService,
          useValue: { elencaNotifiche: () => of({ elementi: [], non_lette: 0 }) },
        },
        { provide: SocketService, useValue: { ascolta: () => NEVER } },
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

  it('con il logo caricato lo mostra al posto delle iniziali', async () => {
    impostazioni[CHIAVI_IMPOSTAZIONI.logo] = 'media/logo.webp';
    const elemento = await crea();
    delete impostazioni[CHIAVI_IMPOSTAZIONI.logo];

    expect(elemento.querySelector('.marchio img')?.getAttribute('src')).toContain(
      'media/logo.webp',
    );
    expect(elemento.querySelector('.marchio-arco')).toBeNull();
  });

  it('collega privacy, termini e cookie policy', async () => {
    const elemento = await crea();

    const link = [...elemento.querySelectorAll('.piede-legale a')].map((a) =>
      a.getAttribute('href'),
    );
    expect(link).toEqual(['/documenti/privacy', '/documenti/termini', '/documenti/cookie']);
  });

  it('mostra le voci del sito nel menu a cassetto', async () => {
    const elemento = await crea();

    const menu = elemento.querySelector('#menu-sito');
    expect(menu?.hasAttribute('popover')).toBe(true);
    expect([...menu!.querySelectorAll('a')].map((a) => a.getAttribute('href'))).toEqual(
      MENU_PUBBLICO.map((voce) => voce.percorso),
    );
    expect(elemento.querySelector('[popovertarget="menu-sito"]')).not.toBeNull();
  });

  it('senza sessione offre il pulsante di accesso', async () => {
    const elemento = await crea();

    expect(elemento.querySelector('a[href="/accesso"]')).not.toBeNull();
    expect(elemento.querySelector('app-menu-utente')).toBeNull();
    expect(elemento.querySelector('app-campanella')).toBeNull();
  });

  it('con la sessione mostra la campanella delle notifiche e il menu utente', async () => {
    collegato.set(true);
    const elemento = await crea();

    expect(elemento.querySelector('app-campanella')).not.toBeNull();
    expect(elemento.querySelector('app-menu-utente')).not.toBeNull();
    expect(elemento.querySelector('a[href="/accesso"]')).toBeNull();
  });
});
