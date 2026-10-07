import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

import { partenzaDopoArrivo } from '../../../core/services/disponibilita/date-soggiorno';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { LIMITI_OSPITI } from '../../../core/services/prenotazioni/prenotazioni-costanti';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import { FiltriDisponibilita } from '../../../shared/models/disponibilita/disponibilita-model';
import { FiltriOccupazione } from '../../../shared/models/occupazione-camera/occupazione-camera-model';
import {
  CalendarioSoggiornoComponent,
  DateSoggiorno,
} from '../calendario-soggiorno-component/calendario-soggiorno-component';

/** Adulti proposti all'apertura: la ricerca più comune. */
const ADULTI_PREDEFINITI = 2;

/**
 * Date (dal calendario) e ospiti del soggiorno. Per ogni bambino si chiede l'età, che decide
 * l'esenzione dalla tassa di soggiorno. Adulti e bambini insieme non superano
 * ospitiMax: ognuno dei due arriva al massimo a quello che l'altro lascia libero.
 */
@Component({
  selector: 'app-ricerca-soggiorno',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    CampoComponent,
    IconaComponent,
    CalendarioSoggiornoComponent,
  ],
  templateUrl: './ricerca-soggiorno-component.html',
  styleUrl: './ricerca-soggiorno-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RicercaSoggiornoComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly errori = inject(ErroriService);

  readonly inCorso = input(false);
  /** Ospiti massimi della tipologia; finché non si conosce valgono i limiti generali. */
  readonly ospitiMax = input<number>();
  /** Camera o tipologia scelta sul sito: il calendario ne mostra le notti occupate. */
  readonly occupazione = input<FiltriOccupazione>();
  readonly cerca = output<FiltriDisponibilita>();

  protected readonly limiti = LIMITI_OSPITI;
  protected readonly tetto = computed(() => this.ospitiMax() ?? LIMITI_OSPITI.adulti);
  protected readonly etaPossibili = Array.from(
    { length: LIMITI_OSPITI.etaBambini + 1 },
    (_, eta) => eta,
  );
  protected readonly modulo = this.fb.group(
    {
      arrivo: ['', Validators.required],
      partenza: ['', Validators.required],
      adulti: [
        ADULTI_PREDEFINITI,
        [Validators.required, Validators.min(1), this.entroIlTetto('bambini')],
      ],
      bambini: [
        0,
        [Validators.min(0), Validators.max(LIMITI_OSPITI.bambini), this.entroIlTetto('adulti')],
      ],
      eta_bambini: this.fb.array<number | null>([]),
    },
    { validators: partenzaDopoArrivo },
  );

  protected readonly arrivo = toSignal(this.modulo.controls.arrivo.valueChanges, {
    initialValue: '',
  });
  protected readonly partenza = toSignal(this.modulo.controls.partenza.valueChanges, {
    initialValue: '',
  });
  private readonly adulti = toSignal(this.modulo.controls.adulti.valueChanges, {
    initialValue: ADULTI_PREDEFINITI,
  });
  private readonly bambini = toSignal(this.modulo.controls.bambini.valueChanges, {
    initialValue: 0,
  });
  protected readonly adultiMax = computed(() => this.tetto() - (this.bambini() || 0));
  protected readonly bambiniMax = computed(() =>
    Math.min(LIMITI_OSPITI.bambini, this.tetto() - (this.adulti() || 0)),
  );

  constructor() {
    this.modulo.controls.bambini.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((bambini) => this.adattaEta(bambini));
    // Una tipologia più piccola dei due adulti proposti li riduce; poi si ricontrolla.
    effect(() => {
      const { adulti, bambini } = this.modulo.controls;
      if (adulti.value > this.tetto()) adulti.setValue(this.tetto());
      adulti.updateValueAndValidity();
      bambini.updateValueAndValidity();
    });
    this.ricontrolla('adulti', 'bambini');
    this.ricontrolla('bambini', 'adulti');
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

  /** SCEGLI DATE — dal calendario: l'arrivo da solo azzera la partenza. */
  scegliDate(date: DateSoggiorno): void {
    this.modulo.patchValue(date);
    this.modulo.controls.arrivo.markAsTouched();
    if (date.partenza) this.modulo.controls.partenza.markAsTouched();
  }

  /** Massimo di un campo: il tetto meno gli ospiti dell'altro. */
  private entroIlTetto(altro: 'adulti' | 'bambini'): ValidatorFn {
    return (controllo: AbstractControl) => {
      const occupati = Number(controllo.parent?.get(altro)?.value) || 0;
      return Validators.max(this.tetto() - occupati)(controllo);
    };
  }

  /** Cambiando un campo cambia il massimo dell'altro. */
  private ricontrolla(campo: 'adulti' | 'bambini', altro: 'adulti' | 'bambini'): void {
    this.modulo.controls[campo].valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.modulo.controls[altro].updateValueAndValidity({ emitEvent: false }));
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
