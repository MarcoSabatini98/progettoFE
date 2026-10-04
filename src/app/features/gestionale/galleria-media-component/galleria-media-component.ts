import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { Observable, concatMap, from, last } from 'rxjs';

import {
  FORMATI_MEDIA,
  LUNGHEZZA_TESTO_ALTERNATIVO,
} from '../../../core/services/camere/camere-costanti';
import { ContenutiService } from '../../../core/services/contenuti/contenuti-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { EntitaMedia, MediaInterface } from '../../../shared/models/media/media-model';
import { MediaPipe } from '../../../shared/pipes/media-pipe';

/**
 * Foto di una tipologia, di un pacchetto o del sito: carica (anche più file insieme, in coda),
 * testo alternativo, ordine ed eliminazione dopo conferma. La prima è la copertina.
 */
@Component({
  selector: 'app-galleria-media',
  imports: [TranslocoPipe, IconaComponent, MediaPipe],
  templateUrl: './galleria-media-component.html',
  styleUrl: './galleria-media-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class GalleriaMediaComponent {
  private readonly contenuti = inject(ContenutiService);
  private readonly errori = inject(ErroriService);

  readonly entita = input.required<EntitaMedia>();
  /** null = foto del sito (home, struttura), non di un record. */
  readonly entitaId = input<number | null>(null);
  readonly media = input.required<MediaInterface[]>();
  /** Testo alternativo delle foto nuove, poi si cambia foto per foto. */
  readonly descrizione = input.required<string>();
  /** Caricate, riordinate, descritte o eliminate: chi lo usa rilegge la scheda. */
  readonly cambiati = output();
  /** Chiave dei testi in testa: titolo e aiuto. */
  readonly chiave = input('gestionale.foto');

  protected readonly formati = FORMATI_MEDIA;
  protected readonly lunghezzaTesto = LUNGHEZZA_TESTO_ALTERNATIVO;
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');
  /** Foto di cui si chiede conferma prima di eliminarla. */
  protected readonly daEliminare = signal<number | undefined>(undefined);

  /**
   * CARICA
   * Una alla volta, in fondo alla galleria.
   */
  carica(evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    const file = [...(campo.files ?? [])];
    campo.value = '';
    if (!file.length) return;
    const primo = this.media().length;
    this.esegui(
      from(file).pipe(
        concatMap((foto, indice) =>
          this.contenuti.caricaMedia({
            entita: this.entita(),
            entita_id: this.entitaId(),
            testo_alternativo: this.descrizione(),
            ordine: primo + indice,
            file: foto,
          }),
        ),
        last(),
      ),
    );
  }

  /**
   * DESCRIVI
   * Salva il testo alternativo lasciando il campo, se è cambiato.
   */
  descrivi(foto: MediaInterface, testo: string): void {
    const pulito = testo.trim();
    if (pulito === foto.testo_alternativo) return;
    this.esegui(this.contenuti.aggiornaMedia(foto.id, { testo_alternativo: pulito || null }));
  }

  /**
   * SPOSTA
   * Scambia la foto con la vicina: passo -1 prima, +1 dopo.
   */
  sposta(indice: number, passo: number): void {
    const ids = this.media().map((foto) => foto.id);
    [ids[indice], ids[indice + passo]] = [ids[indice + passo], ids[indice]];
    this.esegui(this.contenuti.riordinaMedia(ids));
  }

  /**
   * ELIMINA
   */
  elimina(id: number): void {
    this.esegui(this.contenuti.eliminaMedia(id));
  }

  private esegui(richiesta: Observable<unknown>): void {
    this.inCorso.set(true);
    this.errore.set('');
    richiesta.subscribe({
      next: () => {
        this.inCorso.set(false);
        this.daEliminare.set(undefined);
        this.cambiati.emit();
      },
      error: (errore: unknown) => {
        this.inCorso.set(false);
        this.errore.set(this.errori.messaggio(errore));
      },
    });
  }
}
