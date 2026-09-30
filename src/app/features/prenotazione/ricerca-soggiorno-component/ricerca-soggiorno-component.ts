import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

import {
  dataCalendario,
  giornoDopo,
  partenzaDopoArrivo,
} from '../../../core/services/disponibilita/date-soggiorno';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { LIMITI_OSPITI } from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { FiltriDisponibilita } from '../../../shared/models/disponibilita/disponibilita-model';

/** Adulti proposti all'apertura: la ricerca più comune. */
const ADULTI_PREDEFINITI = 2;

/**
 * Date e ospiti del soggiorno. Per ogni bambino si chiede l'età, che decide
 * l'esenzione dalla tassa di soggiorno.
 */
@Component({
  selector: 'app-ricerca-soggiorno',
  imports: [ReactiveFormsModule, TranslocoPipe, CampoComponent, IconaComponent],
  templateUrl: './ricerca-soggiorno-component.html',
  styleUrl: './ricerca-soggiorno-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RicercaSoggiornoComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly errori = inject(ErroriService);

  readonly inCorso = input(false);
  readonly cerca = output<FiltriDisponibilita>();

  protected readonly limiti = LIMITI_OSPITI;
  protected readonly etaPossibili = Array.from(
    { length: LIMITI_OSPITI.etaBambini + 1 },
    (_, eta) => eta,
  );
  protected readonly oggi = dataCalendario(new Date());
  protected readonly modulo = this.fb.group(
    {
      arrivo: ['', Validators.required],
      partenza: ['', Validators.required],
      adulti: [
        ADULTI_PREDEFINITI,
        [Validators.required, Validators.min(1), Validators.max(LIMITI_OSPITI.adulti)],
      ],
      bambini: [0, [Validators.min(0), Validators.max(LIMITI_OSPITI.bambini)]],
      eta_bambini: this.fb.array<number | null>([]),
    },
    { validators: partenzaDopoArrivo },
  );

  private readonly arrivo = toSignal(this.modulo.controls.arrivo.valueChanges, {
    initialValue: '',
  });
  protected readonly partenzaMinima = computed(() => giornoDopo(this.arrivo() || this.oggi));

  constructor() {
    this.modulo.controls.bambini.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((bambini) => this.adattaEta(bambini));
  }

  /**
   * INVIA
   * Le età sono già numeri: il modulo è valido solo se ogni bambino ne ha una.
   */
  invia(): void {
    if (this.modulo.invalid) {
      this.modulo.markAllAsTouched();
      return;
    }
    const { eta_bambini, ...resto } = this.modulo.getRawValue();
    this.cerca.emit({ ...resto, eta_bambini: eta_bambini.map(Number) });
  }

  /** Un campo età per bambino: si aggiungono o tolgono in fondo. */
  private adattaEta(bambini: number): void {
    const eta = this.modulo.controls.eta_bambini;
    while (eta.length < bambini) {
      eta.push(this.fb.control<number | null>(null, Validators.required));
    }
    while (eta.length > Math.max(bambini, 0)) {
      eta.removeAt(eta.length - 1);
    }
  }
}
