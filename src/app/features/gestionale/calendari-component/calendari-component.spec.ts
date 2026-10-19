import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { CalendariService } from '../../../core/services/calendari/calendari-service';
import { CamereService } from '../../../core/services/camere/camere-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { CalendariComponent } from './calendari-component';

describe('CalendariComponent', () => {
  it('apre sui calendari da importare e passa ai link da esportare', async () => {
    const calendari = {
      elencaCalendari: vi.fn(() => of([])),
      elencaLinkEsportazione: vi.fn(() => of([])),
    };
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        { provide: CalendariService, useValue: calendari },
        { provide: CamereService, useValue: { elencaCamere: () => of([]) } },
      ],
    });
    const fixture = TestBed.createComponent(CalendariComponent);
    fixture.componentRef.setInput('id', '4');
    await fixture.whenStable();
    const elemento: HTMLElement = fixture.nativeElement;
    const linguette = elemento.querySelectorAll<HTMLButtonElement>('.linguette button');

    expect(linguette).toHaveLength(2);
    expect(elemento.querySelector('app-calendari-esterni')).not.toBeNull();

    linguette[1].click();
    await fixture.whenStable();

    expect(elemento.querySelector('app-calendari-esterni')).toBeNull();
    expect(elemento.querySelector('app-link-esportazione')).not.toBeNull();
    expect(calendari.elencaLinkEsportazione).toHaveBeenCalled();
  });
});
