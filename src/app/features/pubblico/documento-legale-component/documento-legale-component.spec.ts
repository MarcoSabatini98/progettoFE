import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ContenutiService } from '../../../core/services/contenuti/contenuti-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { DocumentoLegaleComponent } from './documento-legale-component';

describe('DocumentoLegaleComponent', () => {
  const contenuti = { leggiDocumentoVigente: vi.fn() };

  beforeEach(() => {
    contenuti.leggiDocumentoVigente.mockReset();
    TestBed.configureTestingModule({
      imports: [traduzioniTest({ documenti: { privacy: 'Privacy' } })],
      providers: [
        provideRouter([]),
        { provide: ContenutiService, useValue: contenuti },
        { provide: LinguaService, useValue: { attiva: () => 'en' } },
      ],
    });
  });

  async function crea(tipo: string) {
    const fixture = TestBed.createComponent(DocumentoLegaleComponent);
    fixture.componentRef.setInput('tipo', tipo);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('mostra il documento vigente nella lingua del sito', async () => {
    contenuti.leggiDocumentoVigente.mockReturnValue(
      of({ tipo: 'privacy', versione: '1.0', contenuto: 'Testo della privacy' }),
    );

    const elemento = await crea('privacy');

    expect(contenuti.leggiDocumentoVigente).toHaveBeenCalledWith('privacy', 'en');
    expect(elemento.querySelector('h1')?.textContent).toContain('Privacy');
    expect(elemento.querySelector('.testo')?.textContent).toBe('Testo della privacy');
  });

  it('con un tipo sconosciuto non chiama il backend', async () => {
    const elemento = await crea('segreti');

    expect(contenuti.leggiDocumentoVigente).not.toHaveBeenCalled();
    expect(elemento.querySelector('h1')?.textContent).toContain('documenti.nonDisponibile');
  });

  it('senza documento pubblicato lo dice', async () => {
    contenuti.leggiDocumentoVigente.mockReturnValue(throwError(() => new Error('404')));

    const elemento = await crea('cookie');

    expect(elemento.querySelector('h1')?.textContent).toContain('documenti.nonDisponibile');
  });
});
