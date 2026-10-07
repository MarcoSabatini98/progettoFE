import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { Observable, finalize, map, of, switchMap, tap } from 'rxjs';

import { Listino } from '../../../core/services/api/listino';
import { AvvisiService } from '../../../core/services/avvisi/avvisi-service';
import { FORMATI_MEDIA } from '../../../core/services/camere/camere-costanti';
import { LIMITI_CONTENUTI } from '../../../core/services/contenuti/contenuti-costanti';
import { ContenutiService } from '../../../core/services/contenuti/contenuti-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { PAGINE_SITO } from '../../../core/services/sistema/sistema-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import {
  ChiavePagina,
  PaginaSitoInterface,
} from '../../../shared/models/pagina-sito/pagina-sito-model';
import { SezioneCreaPayload, SezioneInterface } from '../../../shared/models/sezione/sezione-model';
import { AzioniListinoComponent } from '../azioni-listino-component/azioni-listino-component';
import { GalleriaMediaComponent } from '../galleria-media-component/galleria-media-component';
import { ListinoComponent } from '../listino-component/listino-component';
import { TraduzioniComponent } from '../traduzioni-component/traduzioni-component';

/**
 * Pagine del sito scritte dallo staff: home, struttura, attività, camere.
 * Tranne la home hanno descrizione e foto di copertina; le sezioni immagine-testo,
 * alternate sul sito e messe in fila con l'ordine, le hanno tutte tranne camere,
 * che ha invece un paragrafo sotto la copertina.
 */
@Component({
  selector: 'app-gestione-pagine',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    CampoComponent,
    IconaComponent,
    ListinoComponent,
    AzioniListinoComponent,
    GalleriaMediaComponent,
    TraduzioniComponent,
  ],
  templateUrl: './gestione-pagine-component.html',
  styleUrl: './gestione-pagine-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GestionePagineComponent {
  private readonly contenuti = inject(ContenutiService);
  private readonly avvisi = inject(AvvisiService);
  private readonly transloco = inject(TranslocoService);
  protected readonly errori = inject(ErroriService);

  protected readonly limiti = LIMITI_CONTENUTI;
  protected readonly formatiImmagine = FORMATI_MEDIA;
  /** Immagine scelta nel modulo di una sezione nuova: si carica appena la sezione esiste. */
  protected readonly immagine = signal<File | undefined>(undefined);
  protected readonly pagineSito = PAGINE_SITO;
  protected readonly chiave = signal<ChiavePagina>('home');
  /** Riempite insieme all'elenco delle sezioni: una sola chiamata per tutto. */
  private readonly pagine = signal<PaginaSitoInterface[]>([]);
  protected readonly pagina = computed(() =>
    this.pagine().find((voce) => voce.chiave === this.chiave()),
  );

  private readonly campi = inject(NonNullableFormBuilder);
  protected readonly modulo = this.campi.group({
    titolo: ['', [Validators.required, Validators.maxLength(LIMITI_CONTENUTI.titolo)]],
    testo: ['', [Validators.required, Validators.maxLength(LIMITI_CONTENUTI.testo)]],
    ordine: [0, [Validators.min(0), Validators.max(LIMITI_CONTENUTI.ordine)]],
    pubblicata: [true],
  });
  protected readonly listino = new Listino<SezioneInterface, Omit<SezioneCreaPayload, 'pagina_id'>>(
    {
      elenca: () =>
        this.contenuti.elencaPagine().pipe(
          tap((pagine) => this.pagine.set(pagine)),
          map(() => this.pagina()?.sezioni ?? []),
        ),
      crea: (dati) =>
        this.contenuti
          .creaSezione({ ...dati, pagina_id: this.pagina()!.id })
          .pipe(switchMap((sezione) => this.caricaImmagine(sezione))),
      aggiorna: (id, dati) => this.contenuti.aggiornaSezione(id, dati),
      elimina: (id) => this.contenuti.eliminaSezione(id),
    },
    this.modulo,
  );
  /** Immagine della sezione scelta, riletta dall'elenco dopo ogni caricamento. */
  protected readonly mediaScelta = computed(() => {
    const id = this.listino.scelta()?.id;
    const sezioni = this.listino.elenco.hasValue() ? this.listino.elenco.value() : [];
    return sezioni.find((sezione) => sezione.id === id)?.media ?? [];
  });

  /** Descrizione sotto il titolo, sopra la copertina; il paragrafo solo per camere. */
  protected readonly moduloPagina = this.campi.group({
    descrizione: ['', Validators.maxLength(LIMITI_CONTENUTI.descrizione)],
    testo: ['', Validators.maxLength(LIMITI_CONTENUTI.paragrafo)],
  });
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');

  constructor() {
    effect(() =>
      this.moduloPagina.reset({
        descrizione: this.pagina()?.descrizione ?? '',
        testo: this.pagina()?.testo ?? '',
      }),
    );
  }

  /**
   * SCEGLI
   * Un'altra pagina: si rilegge l'elenco e si riparte da una sezione nuova.
   */
  scegli(chiave: ChiavePagina): void {
    this.chiave.set(chiave);
    this.errore.set('');
    this.immagine.set(undefined);
    this.listino.ricarica();
  }

  /**
   * SALVA DESCRIZIONE
   * Descrizione vuota = sul sito torna l'introduzione predefinita; paragrafo vuoto = non c'è.
   */
  salvaDescrizione(id: number): void {
    if (this.moduloPagina.invalid) return;
    const { descrizione, testo } = this.moduloPagina.getRawValue();
    this.inCorso.set(true);
    this.errore.set('');
    this.contenuti
      .aggiornaPagina(id, { descrizione: descrizione.trim() || null, testo: testo.trim() || null })
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: () => {
          this.avvisi.mostra(
            this.transloco.translate('gestionale.pagine.descrizioneSalvata'),
            'successo',
          );
          this.listino.elenco.reload();
        },
        error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
      });
  }

  /**
   * SCEGLI IMMAGINE
   * Il campo si svuota subito: si può riscegliere lo stesso file.
   */
  scegliImmagine(evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    this.immagine.set(campo.files?.[0]);
    campo.value = '';
  }

  /** Con l'immagine scelta alla creazione, testo alternativo = titolo. */
  private caricaImmagine(sezione: SezioneInterface): Observable<SezioneInterface> {
    const file = this.immagine();
    if (!file) return of(sezione);
    return this.contenuti
      .caricaMedia({
        entita: 'sezione',
        entita_id: sezione.id,
        testo_alternativo: sezione.titolo,
        ordine: 0,
        file,
      })
      .pipe(
        tap(() => this.immagine.set(undefined)),
        map(() => sezione),
      );
  }
}
