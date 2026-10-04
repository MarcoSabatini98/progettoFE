import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { finalize, forkJoin, map } from 'rxjs';

import {
  PERIODI_ANDAMENTO,
  PeriodoAndamento,
  VoceAndamento,
  intervallo,
  intervalloPrecedente,
  mediaPerGiornoSettimana,
  perMese,
  raggruppa,
  variazione,
} from '../../../core/services/analytics/andamento';
import { AnalyticsService } from '../../../core/services/analytics/analytics-service';
import { salvaFile } from '../../../core/services/api/salva-file';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { LinguaService } from '../../../core/services/lingua/lingua-service';
import { GraficoBarreComponent } from '../../../shared/grafico-barre-component/grafico-barre-component';
import { IconaComponent } from '../../../shared/icona-component/icona-component';
import {
  BarraGraficoInterface,
  FormatoGrafico,
} from '../../../shared/models/barra-grafico/barra-grafico-model';
import { ReportOccupazioneInterface } from '../../../shared/models/report-occupazione/report-occupazione-model';
import { StatisticaCanaleInterface } from '../../../shared/models/statistica-canale/statistica-canale-model';
import { PrezzoPipe } from '../../../shared/pipes/prezzo-pipe';

type Riepilogo = ReportOccupazioneInterface['riepilogo'];

/** Numeri del periodo, confrontati con il periodo prima. */
const INDICATORI = [
  { chiave: 'occupazione_percentuale', icona: 'hotel', formato: 'percentuale' },
  { chiave: 'ricavo_camere', icona: 'payments', formato: 'prezzo' },
  { chiave: 'adr', icona: 'sell', formato: 'prezzo' },
  { chiave: 'revpar', icona: 'trending_up', formato: 'prezzo' },
  { chiave: 'notti_vendute', icona: 'bedtime', formato: 'numero' },
] as const satisfies readonly {
  chiave: keyof Riepilogo;
  icona: string;
  formato: FormatoGrafico | 'numero';
}[];

/** Righe della scheda di un canale; valore è un importo. */
const CAMPI_CANALE = [
  'prenotazioni',
  'cancellate',
  'no_show',
  'notti',
  'valore',
  'durata_media',
  'anticipo_medio_giorni',
] as const satisfies readonly (keyof StatisticaCanaleInterface)[];

/** Lunedì 1 gennaio 2024: da qui i nomi dei giorni della settimana nella lingua del sito. */
const UN_LUNEDI = new Date(2024, 0, 1);

/**
 * Andamento della struttura in un periodo: occupazione, ricavi, prezzo medio e RevPAR
 * rispetto al periodo prima, giorno per giorno (mese per mese nell'anno), per giorno
 * della settimana, per tipologia, per camera e per canale. Il report PDF ha gli stessi dati.
 */
@Component({
  selector: 'app-andamento',
  imports: [NgTemplateOutlet, TranslocoPipe, GraficoBarreComponent, IconaComponent, PrezzoPipe],
  templateUrl: './andamento-component.html',
  styleUrl: './andamento-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AndamentoComponent {
  private readonly analytics = inject(AnalyticsService);
  private readonly lingua = inject(LinguaService);
  private readonly documento = inject(DOCUMENT);
  protected readonly errori = inject(ErroriService);

  protected readonly periodi = PERIODI_ANDAMENTO;
  protected readonly campiCanale = CAMPI_CANALE;
  protected readonly periodo = signal<PeriodoAndamento>('mese');
  protected readonly scaricando = signal(false);
  protected readonly erroreReport = signal('');

  protected readonly dati = rxResource({
    params: () => this.periodo(),
    stream: ({ params }) => {
      const filtri = intervallo(params);
      return forkJoin({
        occupazione: this.analytics.leggiOccupazione(filtri),
        precedente: this.analytics.leggiOccupazione(intervalloPrecedente(params)),
        ricavi: this.analytics.leggiRicavi(filtri),
        canali: this.analytics.elencaCanali(filtri),
      }).pipe(map((dati) => ({ ...dati, mensile: perMese(params) })));
    },
  });

  private readonly formati = computed(() => {
    const lingua = this.lingua.attiva();
    return {
      giorno: new Intl.DateTimeFormat(lingua, { day: 'numeric' }),
      giornoEsteso: new Intl.DateTimeFormat(lingua, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
      mese: new Intl.DateTimeFormat(lingua, { month: 'short' }),
      meseEsteso: new Intl.DateTimeFormat(lingua, { month: 'long', year: 'numeric' }),
      settimana: new Intl.DateTimeFormat(lingua, { weekday: 'short' }),
      settimanaEsteso: new Intl.DateTimeFormat(lingua, { weekday: 'long' }),
      numero: new Intl.NumberFormat(lingua, { maximumFractionDigits: 1 }),
      variazione: new Intl.NumberFormat(lingua, {
        style: 'percent',
        signDisplay: 'exceptZero',
        maximumFractionDigits: 1,
      }),
    };
  });

  protected readonly indicatori = computed(() => {
    if (!this.dati.hasValue()) {
      return [];
    }
    const { occupazione, precedente } = this.dati.value();
    return INDICATORI.map((indicatore) => ({
      ...indicatore,
      valore: occupazione.riepilogo[indicatore.chiave],
      variazione: variazione(
        occupazione.riepilogo[indicatore.chiave],
        precedente.riepilogo[indicatore.chiave],
      ),
    }));
  });

  protected readonly grafici = computed(() => {
    if (!this.dati.hasValue()) {
      return null;
    }
    const { occupazione, mensile } = this.dati.value();
    const voci = raggruppa(occupazione.giorni, mensile);
    return {
      occupazione: voci.map((voce) => this.barraPeriodo(voce, mensile, voce.occupazione)),
      ricavi: voci.map((voce) => this.barraPeriodo(voce, mensile, voce.ricavo)),
      settimana: mediaPerGiornoSettimana(occupazione.giorni).map((valore, indice) =>
        this.barraSettimana(indice, valore),
      ),
    };
  });

  /** Testo di una variazione nella lingua del sito: "+12,5%". */
  testoVariazione(frazione: number): string {
    return this.formati().variazione.format(frazione);
  }

  testoNumero(numero: number): string {
    return this.formati().numero.format(numero);
  }

  /** Quota di un ricavo sul totale del periodo, per la lunghezza della barra. */
  quota(valore: number): number {
    const totale = this.dati.hasValue() ? this.dati.value().ricavi.totale : 0;
    return totale > 0 ? (valore * 100) / totale : 0;
  }

  /**
   * REPORT
   * PDF con occupazione e ricavi del periodo scelto.
   */
  scaricaReport(): void {
    const filtri = intervallo(this.periodo());
    this.scaricando.set(true);
    this.erroreReport.set('');
    this.analytics
      .scaricaReport(filtri)
      .pipe(finalize(() => this.scaricando.set(false)))
      .subscribe({
        next: (file) => salvaFile(this.documento, file, `report-${filtri.dal}.pdf`),
        error: (errore: unknown) => this.erroreReport.set(this.errori.messaggio(errore)),
      });
  }

  private barraPeriodo(
    voce: VoceAndamento,
    mensile: boolean,
    valore: number,
  ): BarraGraficoInterface {
    const formati = this.formati();
    const data = new Date(`${voce.inizio}T00:00`);
    return {
      etichetta: (mensile ? formati.mese : formati.giorno).format(data),
      dettaglio: (mensile ? formati.meseEsteso : formati.giornoEsteso).format(data),
      valore,
    };
  }

  private barraSettimana(indice: number, valore: number): BarraGraficoInterface {
    const formati = this.formati();
    const data = new Date(UN_LUNEDI.getFullYear(), 0, UN_LUNEDI.getDate() + indice);
    return {
      etichetta: formati.settimana.format(data),
      dettaglio: formati.settimanaEsteso.format(data),
      valore,
    };
  }
}
