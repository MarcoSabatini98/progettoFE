import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NEVER, of } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';

import { AuthService } from '../../core/services/auth/auth-service';
import { PresenzeService } from '../../core/services/chat/presenze-service';
import { CHIAVI_IMPOSTAZIONI } from '../../core/services/impostazioni/impostazioni-costanti';
import { ImpostazioniService } from '../../core/services/impostazioni/impostazioni-service';
import { traduzioniTest } from '../../core/services/lingua/configura-transloco-test';
import { NotificheService } from '../../core/services/notifiche/notifiche-service';
import { NavigazioneService } from '../../core/services/navigazione/navigazione-service';
import { SocketService } from '../../core/services/socket/socket-service';
import { GruppoMenuInterface } from '../../shared/models/voce-menu/voce-menu-model';
import { AreaStaffComponent } from './area-staff-component';

describe('AreaStaffComponent', () => {
  const impostazioni: Record<string, string> = {
    [CHIAVI_IMPOSTAZIONI.nome]: 'Casa del Mare',
    [CHIAVI_IMPOSTAZIONI.logo]: 'media/logo.webp',
  };
  const menuStaff = signal<GruppoMenuInterface[]>([
    {
      etichetta: 'menu.gruppi.oggi',
      voci: [
        { etichetta: 'menu.voci.pulizie', percorso: '/staff/pulizie', icona: 'cleaning_services' },
        { etichetta: 'menu.voci.chat', percorso: '/staff/chat', icona: 'chat' },
      ],
    },
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: NavigazioneService, useValue: { menuStaff, staff: signal(true) } },
        { provide: AuthService, useValue: { utente: signal(null) } },
        { provide: PresenzeService, useValue: {} },
        {
          provide: NotificheService,
          useValue: { elencaNotifiche: () => of({ elementi: [], non_lette: 0 }) },
        },
        { provide: SocketService, useValue: { ascolta: () => NEVER } },
        {
          provide: ImpostazioniService,
          useValue: {
            pubbliche: signal({}),
            testo: (chiave: string) => impostazioni[chiave] ?? '',
          },
        },
      ],
    });
  });

  it('mostra nome e logo della struttura nella barra', async () => {
    const marchio = (await crea()).querySelector('.marchio');

    expect(marchio?.textContent).toContain('Casa del Mare');
    expect(marchio?.querySelector('img')?.getAttribute('src')).toContain('media/logo.webp');
  });

  async function crea() {
    const fixture = TestBed.createComponent(AreaStaffComponent);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('applica i token del gestionale', async () => {
    expect((await crea()).classList).toContain('area-gestionale');
  });

  it('mostra i gruppi del menu con le voci permesse', async () => {
    const elemento = await crea();

    expect(elemento.querySelector('.gruppo-titolo')?.textContent).toContain('menu.gruppi.oggi');
    expect(
      [...elemento.querySelectorAll<HTMLAnchorElement>('.voce')].map((voce) =>
        voce.getAttribute('href'),
      ),
    ).toEqual(['/staff/pulizie', '/staff/chat']);
  });

  it('mostra tema e campanella delle notifiche nella barra', async () => {
    const elemento = await crea();
    expect(elemento.querySelector('.barra app-selettore-tema + app-campanella')).not.toBeNull();
    expect(elemento.querySelector('.binario app-selettore-tema')).toBeNull();
  });

  it('il pulsante della barra apre il menu come popover', async () => {
    const elemento = await crea();
    const menu = elemento.querySelector('nav')!;

    expect(menu.hasAttribute('popover')).toBe(true);
    expect(elemento.querySelector('[popovertarget]')?.getAttribute('popovertarget')).toBe(menu.id);
  });
});
