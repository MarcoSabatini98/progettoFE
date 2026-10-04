import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { finalize } from 'rxjs';

import { Listino } from '../../../core/services/api/listino';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { LIMITI_CONTENUTI } from '../../../core/services/contenuti/contenuti-costanti';
import { ContenutiService } from '../../../core/services/contenuti/contenuti-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { LINGUA_PREDEFINITA, NOMI_LINGUE } from '../../../core/services/lingua/lingua-costanti';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { TIPI_DOCUMENTO_LEGALE } from '../../../core/services/sistema/sistema-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import {
  DocumentoLegaleCreaPayload,
  DocumentoLegaleInterface,
  TipoDocumentoLegale,
} from '../../../shared/models/documento-legale/documento-legale-model';
import { Lingua } from '../../../shared/models/lingua/lingua-model';
import { DataPipe } from '../../../shared/pipes/data-pipe';
import { AzioniListinoComponent } from '../azioni-listino-component/azioni-listino-component';
import { ListinoComponent } from '../listino-component/listino-component';

/**
 * Privacy, termini e cookie policy: si scrive una bozza, si pubblica e da lì è in vigore.
 * Pubblicato non si tocca più: si parte da lì per una versione nuova.
 */
@Component({
  selector: 'app-documenti-legali',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    CampoComponent,
    IconaComponent,
    ListinoComponent,
    AzioniListinoComponent,
    DataPipe,
  ],
  templateUrl: './documenti-legali-component.html',
  styleUrl: './documenti-legali-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentiLegaliComponent {
  private readonly contenuti = inject(ContenutiService);
  private readonly avvisi = inject(AvvisiService);
  private readonly transloco = inject(TranslocoService);
  protected readonly errori = inject(ErroriService);
  protected readonly lingue = inject(LinguaService).disponibili;

  protected readonly tipi = TIPI_DOCUMENTO_LEGALE;
  protected readonly nomi = NOMI_LINGUE;
  protected readonly limiti = LIMITI_CONTENUTI;
  /** Bozza di cui si chiede conferma prima di pubblicarla. */
  protected readonly daPubblicare = signal<number | undefined>(undefined);
  protected readonly modulo = inject(NonNullableFormBuilder).group({
    tipo: ['privacy' as TipoDocumentoLegale],
    lingua: [LINGUA_PREDEFINITA as Lingua],
    versione: ['', [Validators.required, Validators.maxLength(LIMITI_CONTENUTI.versione)]],
    contenuto: ['', [Validators.required, Validators.maxLength(LIMITI_CONTENUTI.contenuto)]],
  });
  protected readonly listino = new Listino<DocumentoLegaleInterface, DocumentoLegaleCreaPayload>(
    {
      elenca: () => this.contenuti.elencaDocumentiLegali(),
      crea: (dati) => this.contenuti.creaDocumentoLegale(dati),
      aggiorna: (id, dati) => this.contenuti.aggiornaDocumentoLegale(id, dati),
      elimina: (id) => this.contenuti.eliminaDocumentoLegale(id),
    },
    this.modulo,
  );

  /**
   * NUOVA VERSIONE
   * Bozza nuova con lo stesso testo del documento pubblicato: si cambia e si dà un'altra versione.
   */
  nuovaVersione({ tipo, lingua, contenuto }: DocumentoLegaleInterface): void {
    this.listino.nuovaDa({ tipo, lingua, contenuto: contenuto ?? '' });
  }

  /**
   * PUBBLICA
   * La bozza diventa la versione in vigore per il suo tipo e lingua.
   */
  pubblica(id: number): void {
    const listino = this.listino;
    listino.inCorso.set(true);
    listino.errore.set('');
    this.contenuti
      .pubblicaDocumentoLegale(id)
      .pipe(finalize(() => listino.inCorso.set(false)))
      .subscribe({
        next: (documento) => {
          this.daPubblicare.set(undefined);
          this.avvisi.mostra(
            this.transloco.translate('gestionale.contenuti.documenti.pubblicato'),
            'successo',
          );
          listino.scegli(documento);
          listino.elenco.reload();
        },
        error: (errore: unknown) => listino.errore.set(this.errori.messaggio(errore)),
      });
  }
}
