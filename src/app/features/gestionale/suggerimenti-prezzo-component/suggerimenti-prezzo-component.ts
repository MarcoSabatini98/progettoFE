import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

import { AnalyticsService } from '../../../core/services/analytics/analytics-service';
import { CamereService } from '../../../core/services/camere/camere-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { CampoComponent } from '../../../shared/campo-component/campo-component';
import { DataPipe } from '../../../shared/pipes/data-pipe';
import { PrezzoPipe } from '../../../shared/pipes/prezzo-pipe';

/**
 * Prezzi suggeriti per i prossimi 30 giorni: solo i giorni da ritoccare, con la
 * percentuale e i motivi. Scegliendo una tipologia anche il prezzo dal suo prezzo base.
 * Decide l'admin: da qui non si cambia nessun listino.
 */
@Component({
  selector: 'app-suggerimenti-prezzo',
  imports: [ReactiveFormsModule, TranslocoPipe, CampoComponent, DataPipe, PrezzoPipe],
  templateUrl: './suggerimenti-prezzo-component.html',
  styleUrl: './suggerimenti-prezzo-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuggerimentiPrezzoComponent {
  private readonly analytics = inject(AnalyticsService);
  private readonly camere = inject(CamereService);
  private readonly lingua = inject(LinguaService);
  protected readonly errori = inject(ErroriService);

  protected readonly tipologie = rxResource({
    stream: () => this.camere.elencaTipologie({ attiva: true }),
  });
  protected readonly campoTipologia = inject(NonNullableFormBuilder).control<number | null>(null);
  private readonly tipologia = toSignal(this.campoTipologia.valueChanges, { initialValue: null });

  protected readonly suggerimenti = rxResource({
    params: () => this.tipologia(),
    stream: ({ params }) =>
      this.analytics.elencaSuggerimentiPrezzo(params ? { tipologia_id: params } : {}),
  });
  /** I giorni senza motivi restano al prezzo di listino: non si mostrano. */
  protected readonly giorni = computed(() =>
    this.suggerimenti.hasValue()
      ? this.suggerimenti.value().filter((giorno) => giorno.motivi.length)
      : [],
  );

  private readonly formatoPercentuale = computed(
    () =>
      new Intl.NumberFormat(this.lingua.attiva(), {
        style: 'percent',
        signDisplay: 'exceptZero',
      }),
  );

  /** "+12%" o "-5%" nella lingua del sito. */
  testoPercentuale(percentuale: number): string {
    return this.formatoPercentuale().format(percentuale / 100);
  }
}
