import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { AuthService } from '../../../core/services/auth/auth-service';
import { traduzioniTest } from '../../../core/services/lingua/configura-transloco-test';
import { ConversazioneInterface } from '../../../shared/models/conversazione/conversazione-model';
import { RigaConversazioneComponent } from './riga-conversazione-component';

describe('RigaConversazioneComponent', () => {
  const UUID = '6f1c2b1e-0000-4000-8000-000000000031';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [traduzioniTest()],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { utente: signal({ id: 1 }) } },
      ],
    });
  });

  function crea(dati: object) {
    const fixture = TestBed.createComponent(RigaConversazioneComponent);
    fixture.componentRef.setInput('conversazione', {
      uuid: UUID,
      titolo: null,
      ...dati,
    } as ConversazioneInterface);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('porta alla chat diretta con il nome del collega e i non letti', () => {
    const elemento = crea({
      tipo: 'staff',
      anteprima: 'Ci sei?',
      non_letti: 2,
      partecipanti: [
        { id: 1, nome: 'Marco', cognome: 'Rossi' },
        { id: 2, nome: 'Anna', cognome: 'Bianchi' },
      ],
    });

    expect(elemento.querySelector('a')?.getAttribute('href')).toBe(`/staff/chat/${UUID}`);
    expect(elemento.querySelector('.nome')?.textContent).toContain('Anna Bianchi');
    expect(elemento.querySelector('.conteggio')?.textContent).toContain('2');
  });

  it("segnala l'assistenza ancora da prendere", () => {
    const elemento = crea({ tipo: 'assistenza', assegnata_a: null, visitatore: { nome: null } });

    expect(elemento.querySelector('.nome')?.textContent).toContain('gestionale.chat.senzaNome');
    expect(elemento.querySelector('.stato-prenotazione')).not.toBeNull();
  });
});
