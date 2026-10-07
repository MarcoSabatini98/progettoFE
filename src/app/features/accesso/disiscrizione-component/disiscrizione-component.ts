import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AuthService } from '../../../core/services/auth/auth-service';
import { ErroriService } from '../../../core/services/errori/errori-service';
import { PERCORSI_PORTALE } from '../../../core/services/navigazione/navigazione-costanti';
import { IconaComponent } from '../../../shared/icona-component/icona-component';

/**
 * Disiscrizione dalle offerte col link nell'email (?token=...): un clic e basta,
 * senza accesso. Il consenso si riattiva dal profilo.
 */
@Component({
  selector: 'app-disiscrizione',
  imports: [RouterLink, TranslocoPipe, IconaComponent],
  templateUrl: './disiscrizione-component.html',
  styleUrl: '../accesso-pagine.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisiscrizioneComponent {
  private readonly auth = inject(AuthService);
  protected readonly errori = inject(ErroriService);

  /** Token del link nell'email. */
  readonly token = input<string>();

  protected readonly profilo = PERCORSI_PORTALE.profilo;
  /** Ripetuta non fa danni: il backend la ignora se il consenso è già revocato. */
  protected readonly esito = rxResource({
    params: () => this.token() || undefined,
    stream: ({ params }) => this.auth.disiscrivi(params),
  });
}
