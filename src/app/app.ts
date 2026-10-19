import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AvvisiComponent } from './shared/avvisi-component/avvisi-component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AvvisiComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
