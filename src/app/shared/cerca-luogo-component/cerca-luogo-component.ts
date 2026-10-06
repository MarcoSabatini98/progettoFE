import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
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

  /** I comuni con la provincia: ce ne sono di omonimi. */
  protected nome(luogo: LuogoTrovatoInterface): string {
    return luogo.provincia ? `${luogo.descrizione} (${luogo.provincia})` : luogo.descrizione;
  }

  protected scrivi(valore: string): void {
    const luogo = this.suggerimenti().find((voce) => this.nome(voce) === valore) ?? null;
    this.luogo.set(luogo);
    this.testo.set(valore);
    this.scelto.emit(luogo);
  }

  // Scelto un luogo non serve cercare ancora.
  private filtri() {
    const cerca = this.testo().replace(NON_CERCABILI, '').trim();
    if (this.luogo() || cerca.length < LETTERE_MINIME_RICERCA) return undefined;
    return { cerca, tipo: this.tipo(), in_vigore_il: this.inVigoreIl() || undefined };
  }
}
