import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { campiCambiati } from '../../../core/services/api/campi-cambiati';
import { conSpunta } from '../../../core/services/api/con-spunta';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { CAMPI_IMPOSTAZIONI_SPECIALI } from '../../../core/services/impostazioni/impostazioni-costanti';
import { ImpostazioniService } from '../../../core/services/impostazioni/impostazioni-service';
import { LINGUE, NOMI_LINGUE } from '../../../core/services/lingua/lingua-costanti';
import { PREFERENZE_TEMA } from '../../../core/services/tema/tema-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import {
  CampoImpostazione,
  ImpostazioneInterface,
  ImpostazioniAggiornaPayload,
  ValoreImpostazione,
} from '../../../shared/models/impostazione/impostazione-model';
import { Lingua } from '../../../shared/models/lingua/lingua-model';

const CAMPI_PER_TIPO = {
  booleano: 'spunta',
  numero: 'numero',
  testo: 'testo',
  json: 'testo',
} as const;

/**
 * CAMPO IMPOSTAZIONE
 * Il controllo apposito se c'è (colore, orario, lingua…), altrimenti quello del tipo.
 */
export function campoImpostazione({ chiave, tipo }: ImpostazioneInterface): CampoImpostazione {
  return (
    CAMPI_IMPOSTAZIONI_SPECIALI[chiave as keyof typeof CAMPI_IMPOSTAZIONI_SPECIALI] ??
    CAMPI_PER_TIPO[tipo]
  );
}

/**
 * Impostazioni di un gruppo (struttura, soggiorno, aspetto…) in un modulo: salva le sole cambiate.
 */
@Component({
  selector: 'app-gruppo-impostazioni',
  imports: [ReactiveFormsModule, TranslocoPipe, CampoComponent],
  templateUrl: './gruppo-impostazioni-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class GruppoImpostazioniComponent {
  private readonly impostazioni = inject(ImpostazioniService);
  private readonly avvisi = inject(AvvisiService);
  private readonly transloco = inject(TranslocoService);
  private readonly moduli = inject(NonNullableFormBuilder);
  protected readonly errori = inject(ErroriService);

  readonly gruppo = input.required<string>();
  readonly voci = input.required<ImpostazioneInterface[]>();
  /** Salvate: chi lo usa aggiorna il sito. */
  readonly salvate = output();

  protected readonly lingue = LINGUE;
  protected readonly nomiLingue = NOMI_LINGUE;
  protected readonly temi = PREFERENZE_TEMA;
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');
  protected readonly campi = computed(() =>
    this.voci().map((voce) => ({ chiave: voce.chiave, campo: campoImpostazione(voce) })),
  );
  /** Un controllo per voce; dopo il salvataggio torna senza campi toccati. */
  protected readonly modulo = computed(() =>
    this.moduli.record<FormControl<ValoreImpostazione>>(
      // control(): un elenco (lingue attive) passato da solo sarebbe letto come [valore, validatori].
      Object.fromEntries(
        this.voci().map((voce) => [voce.chiave, this.moduli.control(voce.valore)]),
      ),
    ),
  );

  /**
   * LINGUE SCELTE
   * Il valore json delle lingue attive come elenco; vuoto se manca.
   */
  lingueScelte(valore: ValoreImpostazione): readonly Lingua[] {
    return Array.isArray(valore) ? (valore as Lingua[]) : [];
  }

  /**
   * SEGNA LINGUA
   * Lingue attive: aggiunge o toglie una lingua, nell'ordine di LINGUE.
   */
  segnaLingua(chiave: string, lingua: Lingua, spuntata: boolean): void {
    const controllo: FormControl<ValoreImpostazione> = this.modulo().controls[chiave];
    const scelte = conSpunta(new Set(this.lingueScelte(controllo.value)), lingua, spuntata);
    controllo.setValue(LINGUE.filter((voce) => scelte.has(voce)));
    controllo.markAsDirty();
  }

  /**
   * SALVA
   */
  salva(): void {
    const modifiche = campiCambiati(this.modulo().controls) as ImpostazioniAggiornaPayload;
    if (!Object.keys(modifiche).length) return;
    this.inCorso.set(true);
    this.errore.set('');
    this.impostazioni
      .aggiornaImpostazioni(modifiche)
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: () => {
          this.avvisi.mostra(
            this.transloco.translate('gestionale.impostazioni.salvate'),
            'successo',
          );
          this.modulo().markAsPristine();
          this.salvate.emit();
        },
        error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
      });
  }
}
