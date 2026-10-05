import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

import { ErroriService } from '../../../core/services/errori/errori-service';
import {
  FORMATO_CODICE_DESTINATARIO,
  FORMATO_SIGLA,
  INTESTATARIO_PREDEFINITO,
  LUNGHEZZE_FATTURA,
} from '../../../core/services/pagamenti/pagamenti-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';

const L = LUNGHEZZE_FATTURA;

/** Campi dell'intestatario: privato (nome, cognome, CF) o azienda (denominazione, P.IVA). */
export function moduloIntestatario(fb: NonNullableFormBuilder) {
  return fb.group({
    denominazione: ['', Validators.maxLength(L.denominazione)],
    nome: ['', Validators.maxLength(L.nome)],
    cognome: ['', Validators.maxLength(L.nome)],
    codice_fiscale: ['', Validators.maxLength(L.codiceFiscale)],
    partita_iva: ['', Validators.maxLength(L.partitaIva)],
    indirizzo: ['', Validators.maxLength(L.indirizzo)],
    cap: ['', Validators.maxLength(L.cap)],
    comune: ['', Validators.maxLength(L.comune)],
    provincia: ['', Validators.pattern(FORMATO_SIGLA)],
    nazione: [
      INTESTATARIO_PREDEFINITO.nazione as string,
      [Validators.required, Validators.pattern(FORMATO_SIGLA)],
    ],
    codice_destinatario: [
      INTESTATARIO_PREDEFINITO.codice_destinatario as string,
      [Validators.required, Validators.pattern(FORMATO_CODICE_DESTINATARIO)],
    ],
    pec: ['', [Validators.email, Validators.maxLength(L.pec)]],
  });
}

export type ModuloIntestatario = ReturnType<typeof moduloIntestatario>;

/**
 * Intestatario di una fattura: lo stesso modulo per la bozza e per chi la crea
 * intestata a un altro. Il gruppo arriva dal modulo che lo contiene.
 */
@Component({
  selector: 'app-intestatario-fattura',
  imports: [ReactiveFormsModule, TranslocoPipe, CampoComponent],
  templateUrl: './intestatario-fattura-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntestatarioFatturaComponent {
  protected readonly errori = inject(ErroriService);

  readonly gruppo = input.required<ModuloIntestatario>();

  protected readonly lunghezza = L;
}
