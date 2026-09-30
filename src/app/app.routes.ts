import { inject } from '@angular/core';
import { Routes } from '@angular/router';

import { authGuard } from './core/services/auth/auth-guard';
import { ruoloGuard } from './core/services/auth/ruolo-guard';
import { NavigazioneService } from './core/services/navigazione/navigazione-service';
import { RUOLI_STAFF } from './core/services/ruoli/ruoli-costanti';
import { AreaPubblicaComponent } from './layout/area-pubblica-component/area-pubblica-component';
import { AreaStaffComponent } from './layout/area-staff-component/area-staff-component';
import { PaginaNonTrovataComponent } from './layout/pagina-non-trovata-component/pagina-non-trovata-component';
import { RequisitiAccessoInterface } from './shared/models/requisiti-accesso/requisiti-accesso-model';

/**
 * Due layout: il gestionale sotto /staff (solo ruoli dello staff) e il sito pubblico
 * per tutto il resto. Le pagine si caricano quando servono.
 */
export const routes: Routes = [
  {
    path: 'staff',
    component: AreaStaffComponent,
    canActivate: [authGuard, ruoloGuard],
    data: { ruoli: RUOLI_STAFF } satisfies RequisitiAccessoInterface,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: () => inject(NavigazioneService).primaPaginaStaff(),
      },
      {
        path: 'account',
        loadComponent: () =>
          import('./features/profilo/profilo-component/profilo-component').then(
            (m) => m.ProfiloComponent,
          ),
      },
      { path: '**', component: PaginaNonTrovataComponent },
    ],
  },
  {
    path: '',
    component: AreaPubblicaComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/pubblico/home-component/home-component').then((m) => m.HomeComponent),
      },
      {
        path: 'camere',
        loadComponent: () =>
          import('./features/pubblico/camere-component/camere-component').then(
            (m) => m.CamereComponent,
          ),
      },
      {
        path: 'camere/:slug',
        loadComponent: () =>
          import('./features/pubblico/tipologia-component/tipologia-component').then(
            (m) => m.TipologiaComponent,
          ),
      },
      {
        path: 'offerte',
        loadComponent: () =>
          import('./features/pubblico/offerte-component/offerte-component').then(
            (m) => m.OfferteComponent,
          ),
      },
      {
        path: 'recensioni',
        loadComponent: () =>
          import('./features/pubblico/recensioni-component/recensioni-component').then(
            (m) => m.RecensioniComponent,
          ),
      },
      {
        path: 'faq',
        loadComponent: () =>
          import('./features/pubblico/faq-component/faq-component').then((m) => m.FaqComponent),
      },
      {
        path: 'contatti',
        loadComponent: () =>
          import('./features/pubblico/contatti-component/contatti-component').then(
            (m) => m.ContattiComponent,
          ),
      },
      {
        path: 'accesso',
        loadComponent: () =>
          import('./features/accesso/accesso-component/accesso-component').then(
            (m) => m.AccessoComponent,
          ),
      },
      {
        path: 'recupero-password',
        loadComponent: () =>
          import('./features/accesso/recupero-password-component/recupero-password-component').then(
            (m) => m.RecuperoPasswordComponent,
          ),
      },
      {
        path: 'reimposta-password',
        loadComponent: () =>
          import('./features/accesso/reimposta-password-component/reimposta-password-component').then(
            (m) => m.ReimpostaPasswordComponent,
          ),
      },
      {
        path: 'registrazione',
        loadComponent: () =>
          import('./features/accesso/registrazione-component/registrazione-component').then(
            (m) => m.RegistrazioneComponent,
          ),
      },
      {
        path: 'documenti/:tipo',
        loadComponent: () =>
          import('./features/pubblico/documento-legale-component/documento-legale-component').then(
            (m) => m.DocumentoLegaleComponent,
          ),
      },
      {
        path: 'area-personale',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/profilo/profilo-component/profilo-component').then(
            (m) => m.ProfiloComponent,
          ),
      },
      { path: '**', component: PaginaNonTrovataComponent },
    ],
  },
];
