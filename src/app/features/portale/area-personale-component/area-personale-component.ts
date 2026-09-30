import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AuthService } from '../../../core/services/auth/auth-service';
import { MENU_PORTALE } from '../../../core/services/navigazione/navigazione-costanti';
import { IconaComponent } from '../../../shared/icona-component/icona-component';

/** Area personale dei clienti: saluto, schede delle sezioni e la sezione aperta. */
@Component({
  selector: 'app-area-personale',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TranslocoPipe, IconaComponent],
  templateUrl: './area-personale-component.html',
  styleUrl: './area-personale-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pagina' },
})
export class AreaPersonaleComponent {
  protected readonly auth = inject(AuthService);
  protected readonly menu = MENU_PORTALE;
}
