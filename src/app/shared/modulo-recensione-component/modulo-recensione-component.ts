import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { finalize, Observable } from 'rxjs';

import { ErroriService } from '../../core/services/errori/errori-service';
import { LinguaService } from '../../core/services/lingua/lingua-service';
import {
  CATEGORIE_VOTO,
  LUNGHEZZA_RECENSIONE,
  VOTI_RECENSIONE,
} from '../../core/services/prenotazioni/prenotazioni-costanti';
import { CampoComponent } from '../campo-component/campo-component';
import { IconaComponent } from '../icona-component/icona-component';
import { RecensioneCreaPayload } from '../models/recensione/recensione-model';

/**
 * Recensione di un soggiorno concluso: voto in stelle, voti di dettaglio facoltativi,
 * titolo e commento. Chi la usa passa come inviarla (per codice o dall'area personale).
 */
@Component({
  selector: 'app-modulo-recensione',
  imports: [ReactiveFormsModule, TranslocoPipe, CampoComponent, IconaComponent],
  templateUrl: './modulo-recensione-component.html',
  styleUrl: './modulo-recensione-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'scheda' },
})
export class ModuloRecensioneComponent {
  private readonly lingua = inject(LinguaService);
  private readonly moduli = inject(NonNullableFormBuilder);
  protected readonly errori = inject(ErroriService);

  readonly invia = input.required<(dati: RecensioneCreaPayload) => Observable<unknown>>();

  protected readonly voti = VOTI_RECENSIONE;
  protected readonly categorie = CATEGORIE_VOTO;
  protected readonly lunghezza = LUNGHEZZA_RECENSIONE;
  protected readonly inCorso = signal(false);
  protected readonly inviata = signal(false);
  protected readonly errore = signal('');
  protected readonly modulo = this.moduli.group({
    voto: this.moduli.control<number | null>(null, Validators.required),
    voto_pulizia: this.moduli.control<number | null>(null),
    voto_personale: this.moduli.control<number | null>(null),
    voto_posizione: this.moduli.control<number | null>(null),
    voto_comfort: this.moduli.control<number | null>(null),
    voto_qualita_prezzo: this.moduli.control<number | null>(null),
    titolo: ['', Validators.maxLength(LUNGHEZZA_RECENSIONE.titolo)],
    commento: ['', Validators.maxLength(LUNGHEZZA_RECENSIONE.commento)],
    anonima: [false],
  });

  /**
   * INVIA
   * La recensione è scritta nella lingua del sito: così la si mostra a chi la parla.
   */
  inviaRecensione(): void {
    const { voto, ...resto } = this.modulo.getRawValue();
    if (this.modulo.invalid || voto === null) {
      this.modulo.markAllAsTouched();
      return;
    }
    this.inCorso.set(true);
    this.errore.set('');
    this.invia()({ ...resto, voto, lingua: this.lingua.attiva() })
      .pipe(finalize(() => this.inCorso.set(false)))
      .subscribe({
        next: () => this.inviata.set(true),
        error: (errore: unknown) => this.errore.set(this.errori.messaggio(errore)),
      });
  }
}
