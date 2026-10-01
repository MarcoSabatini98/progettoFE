import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';

import { traduzioniTest } from '../lingua/configura-transloco-test';
import { ErroriService } from './errori-service';

// Risposta di errore come la manda il backend.
function erroreApi(status: number, codice: string, messaggio: string): HttpErrorResponse {
  return new HttpErrorResponse({
    status,
    error: { successo: false, errore: { codice, messaggio } },
  });
}

describe('ErroriService', () => {
  let service: ErroriService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        traduzioniTest({
          errori: {
            generico: 'Qualcosa è andato storto',
            rete: 'Connessione assente',
            CREDENZIALI_NON_VALIDE: 'Email o password errate',
          },
          moduli: {
            required: 'Campo obbligatorio',
            minlength: 'Almeno {{ requiredLength }} caratteri',
          },
        }),
      ],
    });
    service = TestBed.inject(ErroriService);
  });

  it('traduce il codice del backend', () => {
    const errore = erroreApi(401, 'CREDENZIALI_NON_VALIDE', 'Credenziali non valide');
    expect(service.messaggio(errore)).toBe('Email o password errate');
  });

  it('senza traduzione usa il messaggio del backend', () => {
    const errore = erroreApi(409, 'CODICE_NUOVO', 'Messaggio del backend');
    expect(service.messaggio(errore)).toBe('Messaggio del backend');
  });

  it('traduce anche un errore arrivato nei dati di una risposta', () => {
    expect(service.testo({ codice: 'CREDENZIALI_NON_VALIDE', messaggio: 'x' })).toBe(
      'Email o password errate',
    );
    expect(service.testo({ codice: 'SOGGIORNO_MINIMO', messaggio: 'Almeno 3 notti' })).toBe(
      'Almeno 3 notti',
    );
  });

  it('riconosce la connessione assente', () => {
    expect(service.messaggio(new HttpErrorResponse({ status: 0 }))).toBe('Connessione assente');
  });

  it('per errori senza corpo o non HTTP usa il testo generico', () => {
    expect(service.messaggio(new HttpErrorResponse({ status: 502 }))).toBe(
      'Qualcosa è andato storto',
    );
    expect(service.messaggio(new Error('boom'))).toBe('Qualcosa è andato storto');
  });

  it('legge il codice del backend, nessuno per errori non HTTP', () => {
    expect(service.codice(erroreApi(409, 'SALDO_APERTO', 'Restano 50 €'))).toBe('SALDO_APERTO');
    expect(service.codice(new HttpErrorResponse({ status: 502 }))).toBeUndefined();
    expect(service.codice(new Error('boom'))).toBeUndefined();
  });

  it('traduce il primo errore di un campo solo dopo che è stato toccato', () => {
    const campo = new FormControl('abc', [Validators.required, Validators.minLength(8)]);
    expect(service.campo(campo)).toBe('');

    campo.markAsTouched();
    expect(service.campo(campo)).toBe('Almeno 8 caratteri');

    campo.setValue('');
    expect(service.campo(campo)).toBe('Campo obbligatorio');

    campo.setValue('password-lunga');
    expect(service.campo(campo)).toBe('');
  });
});
