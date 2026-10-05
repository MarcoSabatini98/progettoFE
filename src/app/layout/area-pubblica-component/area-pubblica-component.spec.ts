import { signal } from '@angular/core';
import { DeferBlockState, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NEVER } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';

import { AuthService } from '../../core/services/auth/auth-service';
import { ChatService } from '../../core/services/chat/chat-service';
import { CHIAVI_IMPOSTAZIONI } from '../../core/services/impostazioni/impostazioni-costanti';
import { ImpostazioniService } from '../../core/services/impostazioni/impostazioni-service';
import { MENU_PUBBLICO } from '../../core/services/navigazione/navigazione-costanti';
import { NavigazioneService } from '../../core/services/navigazione/navigazione-service';
import { SocketService } from '../../core/services/socket/socket-service';
import { traduzioniTest } from '../../core/services/lingua/configura-transloco-test';
import { AreaPubblicaComponent } from './area-pubblica-component';

describe('AreaPubblicaComponent', () => {
  const impostazioni: Record<string, string> = {
    [CHIAVI_IMPOSTAZIONI.nome]: 'Casa del Mare',
    [CHIAVI_IMPOSTAZIONI.email]: 'info@example.com',
    [CHIAVI_IMPOSTAZIONI.cin]: 'IT090064C2000000001',
  };

  const staff = signal(false);

  beforeEach(async () => {
    staff.set(false);
    TestBed.configureTestingModule({
      imports: [traduzioniTest(), AreaPubblicaComponent],
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
        {
          provide: AuthService,
          useValue: { collegato: signal(false), utente: signal(null), token: signal(null) },
        },
        { provide: NavigazioneService, useValue: { staff } },
        { provide: ChatService, useValue: {} },
        { provide: SocketService, useValue: { ascolta: () => NEVER } },
      ],
    });
    // Il widget della chat è in un @defer.
    await TestBed.compileComponents();
  });

  async function crea() {
    const fixture = TestBed.createComponent(AreaPubblicaComponent);
    await fixture.whenStable();
    for (const blocco of await fixture.getDeferBlocks()) {
      await blocco.render(DeferBlockState.Complete);
    }
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
  });

  it('offre la chat di assistenza a visitatori e clienti, non allo staff', async () => {
    expect((await crea()).querySelector('app-widget-chat')).not.toBeNull();

    staff.set(true);
    expect((await crea()).querySelector('app-widget-chat')).toBeNull();
  });
});
