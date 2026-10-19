import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { Observable } from 'rxjs';

import { salvaFile } from '../../core/services/api/salva-file';
import { ErroriService } from '../../core/services/errori/errori-service';
import { FORMATI_DOCUMENTO } from '../../core/services/utenti/utenti-costanti';
import { IconaComponent } from '../icona-component/icona-component';
import {
  AzioniDocumentiInterface,
  DocumentoOspiteInterface,
} from '../models/documento-ospite/documento-ospite-model';
import { DataPipe } from '../pipes/data-pipe';

/**
 * Documenti d'identità caricati: carica, scarica, elimina dopo conferma.
 * Le chiamate le passa chi lo usa (profilo del cliente o anagrafica per lo staff).
 */
@Component({
  selector: 'app-documenti-identita',
  imports: [TranslocoPipe, IconaComponent, DataPipe],
  templateUrl: './documenti-identita-component.html',
  styleUrl: './documenti-identita-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'sezione' },
})
export class DocumentiIdentitaComponent {
  private readonly documento = inject(DOCUMENT);
  private readonly errori = inject(ErroriService);

  readonly documenti = input.required<DocumentoOspiteInterface[]>();
  readonly azioni = input.required<AzioniDocumentiInterface>();
  /** Caricato o eliminato un documento: chi lo usa ricarica l'elenco. */
  readonly cambiati = output();

  protected readonly formati = FORMATI_DOCUMENTO;
  protected readonly inCorso = signal(false);
  protected readonly errore = signal<string | undefined>(undefined);
  /** Documento di cui si chiede conferma prima di eliminarlo. */
  protected readonly daEliminare = signal<number | undefined>(undefined);

  /**
   * CARICA
   */
  carica(evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    const file = campo.files?.[0];
    campo.value = '';
    if (file) this.esegui(this.azioni().carica(file), () => this.cambiati.emit());
  }

  /**
   * SCARICA
   */
  scarica(documento: DocumentoOspiteInterface): void {
    this.esegui(this.azioni().scarica(documento.id), (file) =>
      salvaFile(this.documento, file, documento.nome_originale),
    );
  }

  /**
   * ELIMINA
   */
  elimina(id: number): void {
    this.esegui(this.azioni().elimina(id), () => {
      this.daEliminare.set(undefined);
      this.cambiati.emit();
    });
  }

  private esegui<T>(richiesta: Observable<T>, fatto: (risposta: T) => void): void {
    this.inCorso.set(true);
    this.errore.set(undefined);
    richiesta.subscribe({
      next: (risposta) => {
        this.inCorso.set(false);
        fatto(risposta);
      },
      error: (err: unknown) => {
        this.inCorso.set(false);
        this.errore.set(this.errori.messaggio(err));
      },
    });
  }
}
