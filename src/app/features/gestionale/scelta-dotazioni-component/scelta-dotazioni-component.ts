import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { startWith, switchMap } from 'rxjs';

import { CamereService } from '../../../core/services/camere/camere-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { IconaComponent } from '../../../shared/icona-component/icona-component';

/** Dotazioni incluse (wifi, aria condizionata...): caselle sul controllo con gli id scelti. */
@Component({
  selector: 'app-scelta-dotazioni',
  imports: [TranslocoPipe, IconaComponent],
  templateUrl: './scelta-dotazioni-component.html',
  styleUrl: './scelta-dotazioni-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SceltaDotazioniComponent {
  protected readonly errori = inject(ErroriService);
  private readonly camere = inject(CamereService);

  readonly controllo = input.required<FormControl<number[]>>();

  protected readonly dotazioni = rxResource({
    stream: () => this.camere.elencaServizi({ tipo: 'dotazione', attivo: true }),
  });
  protected readonly scelte = toSignal(
    toObservable(this.controllo).pipe(
      switchMap((controllo) => controllo.valueChanges.pipe(startWith(controllo.value))),
    ),
    { initialValue: [] },
  );

  /**
   * SCEGLI
   */
  scegli(id: number, inclusa: boolean): void {
    const controllo = this.controllo();
    const altre = controllo.value.filter((scelta) => scelta !== id);
    controllo.setValue(inclusa ? [...altre, id] : altre);
    controllo.markAsDirty();
  }
}
