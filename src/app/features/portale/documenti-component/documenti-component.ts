import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { Observable } from 'rxjs';

import { salvaFile } from '../../../core/services/api/salva-file';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { FORMATI_DOCUMENTO } from '../../../core/services/utenti/utenti-costanti';
import { UtentiService } from '../../../core/services/utenti/utenti-service';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { DocumentoOspiteInterface } from '../../../shared/models/documento-ospite/documento-ospite-model';
import { DataPipe } from '../../../shared/pipes/data-pipe';

/** Documenti d'identità del cliente: li carica una volta e valgono per i check-in. */
@Component({
  selector: 'app-documenti',
  imports: [TranslocoPipe, IconaComponent, DataPipe],
  templateUrl: './documenti-component.html',
  styleUrl: './documenti-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'sezione' },
})
export class DocumentiComponent {
  private readonly documento = inject(DOCUMENT);
  private readonly utenti = inject(UtentiService);
  private readonly errori = inject(ErroriService);

  protected readonly formati = FORMATI_DOCUMENTO;
  protected readonly profilo = rxResource({ stream: () => this.utenti.leggiProfilo() });
  protected readonly documenti = computed(() =>
    this.profilo.hasValue() ? (this.profilo.value().anagrafica?.documenti ?? []) : [],
  );
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
    if (file) this.esegui(this.utenti.caricaDocumento(file), () => this.profilo.reload());
  }

  /**
   * SCARICA
   */
  scarica(documento: DocumentoOspiteInterface): void {
    this.esegui(this.utenti.scaricaDocumento(documento.id), (file) =>
      salvaFile(this.documento, file, documento.nome_originale),
    );
  }

  /**
   * ELIMINA
   */
  elimina(id: number): void {
    this.esegui(this.utenti.eliminaDocumento(id), () => {
      this.daEliminare.set(undefined);
      this.profilo.reload();
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
