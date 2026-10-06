import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { switchMap, timer } from 'rxjs';

import { AlloggiatiService } from '../../core/services/alloggiati/alloggiati-service';
import { CampoComponent } from '../campo-component/campo-component';
import { ATTESA_RICERCA_MS, LETTERE_MINIME_RICERCA } from '../../core/services/api/api-costanti';
import {
  LuogoTrovatoInterface,
  TipoLuogo,
} from '../models/alloggiati-luogo/alloggiati-luogo-model';

/** La ricerca accetta solo lettere, spazi, apostrofi, punti e trattini. */
const NON_CERCABILI = /[^\p{L}\s'.-]/gu;

let prossimoElenco = 0;

/**
 * Campo per scegliere un comune o uno stato dalla tabella di Alloggiati Web:
 * si scrive l'inizio del nome e si sceglie tra i suggerimenti (datalist nativo).
 * Vale anche il nome scritto per intero, maiuscole o no, se un solo luogo lo porta.
 * Emette il luogo scelto, o null finché il testo non corrisponde a un suggerimento.
 */
@Component({
  selector: 'app-cerca-luogo',
  imports: [CampoComponent],
  templateUrl: './cerca-luogo-component.html',
  styleUrl: './cerca-luogo-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CercaLuogoComponent {
  private readonly alloggiati = inject(AlloggiatiService);

  readonly etichetta = input.required<string>();
  /** Senza tipo cerca sia comuni sia stati. */
  readonly tipo = input<TipoLuogo>();
  readonly aiuto = input('');
  /**
   * Data (AAAA-MM-GG) in cui il luogo doveva esistere. Per la nascita: chi è
   * nato in un comune poi soppresso va registrato con quello.
   */
  readonly inVigoreIl = input<string>();
  /** Nome del luogo già registrato: si vede nel campo, senza cercarlo. */
  readonly valore = input('');
  readonly scelto = output<LuogoTrovatoInterface | null>();

  protected readonly elenco = `luoghi-${prossimoElenco++}`;
  private readonly testo = signal('');
  private readonly luogo = signal<LuogoTrovatoInterface | null>(null);
  // Cambiando testo la richiesta in attesa si annulla: il timer fa da debounce.
  private readonly ricerca = rxResource({
    params: () => this.filtri(),
    stream: ({ params }) =>
      timer(ATTESA_RICERCA_MS).pipe(switchMap(() => this.alloggiati.cercaLuoghi(params))),
  });
  protected readonly suggerimenti = computed(() =>
    this.ricerca.hasValue() ? this.ricerca.value() : [],
  );

  constructor() {
    // Il nome scritto prima che arrivassero i suggerimenti vale appena arrivano.
    effect(() => {
      const luogo = this.trova(this.testo());
      if (luogo && !untracked(this.luogo)) this.scegli(luogo);
    });
  }

  /** I comuni con la provincia: ce ne sono di omonimi. */
  protected nome(luogo: LuogoTrovatoInterface): string {
    return luogo.provincia ? `${luogo.descrizione} (${luogo.provincia})` : luogo.descrizione;
  }

  protected scrivi(valore: string): void {
    // Prima di cambiare testo: con il testo riparte la ricerca e i suggerimenti si svuotano.
    const luogo = this.trova(valore);
    this.testo.set(valore);
    this.scegli(luogo);
  }

  /** Il suggerimento con quel nome, con o senza provincia; null se nessuno o più d'uno. */
  private trova(valore: string): LuogoTrovatoInterface | null {
    const cercato = valore.trim().toLocaleUpperCase();
    const trovati = this.suggerimenti().filter((voce) =>
      [this.nome(voce), voce.descrizione].some((nome) => nome.toLocaleUpperCase() === cercato),
    );
    return trovati.length === 1 ? trovati[0] : null;
  }

  private scegli(luogo: LuogoTrovatoInterface | null): void {
    this.luogo.set(luogo);
    this.scelto.emit(luogo);
  }

  // Scelto un luogo non serve cercare ancora.
  private filtri() {
    const cerca = this.testo().replace(NON_CERCABILI, '').trim();
    if (this.luogo() || cerca.length < LETTERE_MINIME_RICERCA) return undefined;
    return { cerca, tipo: this.tipo(), in_vigore_il: this.inVigoreIl() || undefined };
  }
}
