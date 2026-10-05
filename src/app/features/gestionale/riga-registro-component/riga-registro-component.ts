import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import {
  RegistroAttivitaInterface,
  TabellaRegistro,
} from '../../../shared/models/registro-attivita/registro-attivita-model';
import { DataPipe } from '../../../shared/pipes/data-pipe';

/** Campo toccato: nella modifica prima e dopo, nell'inserimento solo dopo, nell'eliminazione solo prima. */
export interface CampoRegistro {
  campo: string;
  prima?: string;
  dopo?: string;
}

/** Valore vuoto nel registro. */
const VUOTO = '—';

/** I pagamenti non hanno una scheda: si apre la prenotazione a cui appartengono. */
const SCHEDE: Record<TabellaRegistro, string> = {
  prenotazioni: PERCORSI_STAFF.prenotazioni,
  pagamenti: PERCORSI_STAFF.prenotazioni,
  fatture: PERCORSI_STAFF.fatture,
};

/**
 * Una modifica del registro: quando, chi (o il sistema), cosa e i campi cambiati.
 * Nell'elenco porta alla scheda del record; nella storia di un record no ([collegato]=false).
 */
@Component({
  selector: 'app-riga-registro',
  imports: [RouterLink, TranslocoPipe, DataPipe],
  templateUrl: './riga-registro-component.html',
  styleUrl: './riga-registro-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class RigaRegistroComponent {
  readonly voce = input.required<RegistroAttivitaInterface>();
  readonly collegato = input(true, { transform: booleanAttribute });

  protected readonly campi = computed(() => campiToccati(this.voce()));
  protected readonly scheda = computed(() => {
    const voce = this.voce();
    const id = voce.tabella === 'pagamenti' ? prenotazioneDelPagamento(voce) : voce.record_id;
    return this.collegato() && id ? [SCHEDE[voce.tabella], id] : null;
  });
}

/** Nella modifica solo i campi salvati prima che sono davvero cambiati. */
export function campiToccati({
  azione,
  dati_prima,
  dati_dopo,
}: RegistroAttivitaInterface): CampoRegistro[] {
  if (azione === 'inserimento') {
    return Object.entries(dati_dopo ?? {}).map(([campo, v]) => ({ campo, dopo: testo(v) }));
  }
  if (azione === 'eliminazione') {
    return Object.entries(dati_prima ?? {}).map(([campo, v]) => ({ campo, prima: testo(v) }));
  }
  return Object.entries(dati_prima ?? {})
    .map(([campo, v]) => ({ campo, prima: testo(v), dopo: testo(dati_dopo?.[campo]) }))
    .filter(({ prima, dopo }) => prima !== dopo);
}

function prenotazioneDelPagamento({ dati_prima, dati_dopo }: RegistroAttivitaInterface) {
  const id = dati_dopo?.['prenotazione_id'] ?? dati_prima?.['prenotazione_id'];
  return typeof id === 'number' ? id : null;
}

function testo(valore: unknown): string {
  if (valore === null || valore === undefined || valore === '') return VUOTO;
  return typeof valore === 'object' ? JSON.stringify(valore) : String(valore);
}
