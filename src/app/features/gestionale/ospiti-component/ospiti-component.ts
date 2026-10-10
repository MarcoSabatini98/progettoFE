import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { debounceTime, finalize } from 'rxjs';

import { ATTESA_RICERCA_MS } from '../../../core/services/api/api-costanti';
import { statoPagine } from '../../../core/services/api/stato-pagine';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { PERCORSI_STAFF } from '../../../core/services/navigazione/navigazione-costanti';
import { OspitiService } from '../../../core/services/ospiti/ospiti-service';
import { LUNGHEZZA_DATI_PERSONALI } from '../../../core/services/utenti/utenti-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { PaginazioneComponent } from '../../../shared/paginazione-component/paginazione-component';

/** Anagrafiche degli ospiti: ricerca, elenco a pagine e creazione di una nuova. */
@Component({
  selector: 'app-ospiti',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslocoPipe,
    CampoComponent,
    IconaComponent,
    PaginazioneComponent,
  ],
  templateUrl: './ospiti-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class OspitiComponent {
  private readonly ospiti = inject(OspitiService);
  private readonly router = inject(Router);
  protected readonly errori = inject(ErroriService);

  protected readonly scheda = PERCORSI_STAFF.ospiti;
  protected readonly lunghezza = LUNGHEZZA_DATI_PERSONALI;
  protected readonly cerca = new FormControl('', { nonNullable: true });
  private readonly cercato = toSignal(
    this.cerca.valueChanges.pipe(debounceTime(ATTESA_RICERCA_MS)),
    {
      initialValue: '',
    },
  );
  /** Cambiando ricerca si riparte dalla prima pagina. */
  protected readonly pagine = statoPagine(this.cercato);
  protected readonly elenco = rxResource({
    params: () => ({
      cerca: this.cercato(),
      pagina: this.pagine.pagina(),
      perPagina: this.pagine.perPagina(),
    }),
    stream: ({ params }) => this.ospiti.elencaOspiti(params),
  });
  protected readonly nuovo = inject(NonNullableFormBuilder).group({
    nome: ['', [Validators.required, Validators.maxLength(LUNGHEZZA_DATI_PERSONALI.nome)]],
    cognome: ['', [Validators.required, Validators.maxLength(LUNGHEZZA_DATI_PERSONALI.cognome)]],
  });
  protected readonly inCorso = signal(false);
  protected readonly errore = signal('');

  /**
   * CREA
   * Nuova anagrafica col solo nome: il resto si completa nella sua scheda.
   */
  crea(): void {
    if (this.nuovo.invalid) {
      this.nuovo.markAllAsTouched();
      return;
    }
    this.inCorso.set(true);
    this.errore.set('');
    this.ospiti
      .creaOspite(this.nuovo.getRawValue())
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: (ospite) => void this.router.navigate([this.scheda, ospite.id]),
        error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
      });
  }
}
