import { inject } from '@angular/core';
import { Routes } from '@angular/router';

import { authGuard } from './core/services/auth/auth-guard';
import { ruoloGuard } from './core/services/auth/ruolo-guard';
import { NavigazioneService } from './core/services/navigazione/navigazione-service';
import { PERMESSI, RUOLI, RUOLI_STAFF } from './core/services/ruoli/ruoli-costanti';
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
      {
        path: 'oggi',
        canActivate: [ruoloGuard],
        data: { permessi: [PERMESSI.PRENOTAZIONI_LEGGI] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/giornata-component/giornata-component').then(
            (m) => m.GiornataComponent,
          ),
      },
      {
        path: 'prenotazioni',
        canActivate: [ruoloGuard],
        data: { permessi: [PERMESSI.PRENOTAZIONI_LEGGI] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/prenotazioni-component/prenotazioni-component').then(
            (m) => m.PrenotazioniComponent,
          ),
      },
      {
        // Stesso percorso del sito, con i campi della reception (canale, stato, note interne).
        path: 'prenotazioni/nuova',
        canActivate: [ruoloGuard],
        data: { staff: true, permessi: [PERMESSI.PRENOTAZIONI_GESTISCI] },
        loadComponent: () =>
          import('./features/prenotazione/prenota-component/prenota-component').then(
            (m) => m.PrenotaComponent,
          ),
      },
      {
        path: 'prenotazioni/:id',
        canActivate: [ruoloGuard],
        data: { permessi: [PERMESSI.PRENOTAZIONI_LEGGI] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/scheda-prenotazione-component/scheda-prenotazione-component').then(
            (m) => m.SchedaPrenotazioneComponent,
          ),
      },
      {
        path: 'ospiti',
        canActivate: [ruoloGuard],
        data: { permessi: [PERMESSI.OSPITI_GESTISCI] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/ospiti-component/ospiti-component').then(
            (m) => m.OspitiComponent,
          ),
      },
      {
        path: 'ospiti/:id',
        canActivate: [ruoloGuard],
        data: { permessi: [PERMESSI.OSPITI_GESTISCI] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/scheda-ospite-component/scheda-ospite-component').then(
            (m) => m.SchedaOspiteComponent,
          ),
      },
      {
        path: 'camere',
        canActivate: [ruoloGuard],
        data: { permessi: [PERMESSI.CAMERE_GESTISCI] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/elenco-camere-component/elenco-camere-component').then(
            (m) => m.ElencoCamereComponent,
          ),
      },
      {
        path: 'camere/tipologie/:id',
        canActivate: [ruoloGuard],
        data: { permessi: [PERMESSI.CAMERE_GESTISCI] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/scheda-tipologia-camera-component/scheda-tipologia-camera-component').then(
            (m) => m.SchedaTipologiaCameraComponent,
          ),
      },
      {
        path: 'camere/:id',
        canActivate: [ruoloGuard],
        data: { permessi: [PERMESSI.CAMERE_GESTISCI] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/scheda-camera-component/scheda-camera-component').then(
            (m) => m.SchedaCameraComponent,
          ),
      },
      {
        path: 'alloggiati',
        canActivate: [ruoloGuard],
        data: { permessi: [PERMESSI.ALLOGGIATI_INVIA] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/alloggiati-component/alloggiati-component').then(
            (m) => m.AlloggiatiComponent,
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
        path: 'prenota',
        loadComponent: () =>
          import('./features/prenotazione/prenota-component/prenota-component').then(
            (m) => m.PrenotaComponent,
          ),
      },
      {
        path: 'prenotazioni/:codice',
        loadComponent: () =>
          import('./features/prenotazione/prenotazione-component/prenotazione-component').then(
            (m) => m.PrenotazioneComponent,
          ),
      },
      {
        path: 'prenotazioni/:codice/pagamento',
        loadComponent: () =>
          import('./features/prenotazione/esito-pagamento-component/esito-pagamento-component').then(
            (m) => m.EsitoPagamentoComponent,
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
        path: 'checkin-online',
        loadComponent: () =>
          import('./features/portale/checkin-online-component/checkin-online-component').then(
            (m) => m.CheckinOnlineComponent,
          ),
      },
      {
        path: 'area-personale',
        canActivate: [authGuard, ruoloGuard],
        data: { ruoli: [RUOLI.CLIENTE] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/portale/area-personale-component/area-personale-component').then(
            (m) => m.AreaPersonaleComponent,
          ),
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'prenotazioni' },
          {
            path: 'prenotazioni',
            loadComponent: () =>
              import('./features/portale/mie-prenotazioni-component/mie-prenotazioni-component').then(
                (m) => m.MiePrenotazioniComponent,
              ),
          },
          {
            path: 'prenotazioni/:id',
            loadComponent: () =>
              import('./features/portale/mia-prenotazione-component/mia-prenotazione-component').then(
                (m) => m.MiaPrenotazioneComponent,
              ),
          },
          {
            path: 'fatture',
            loadComponent: () =>
              import('./features/portale/mie-fatture-component/mie-fatture-component').then(
                (m) => m.MieFattureComponent,
              ),
          },
          {
            path: 'fedelta',
            loadComponent: () =>
              import('./features/portale/fedelta-component/fedelta-component').then(
                (m) => m.FedeltaComponent,
              ),
          },
          {
            path: 'documenti',
            loadComponent: () =>
              import('./features/portale/documenti-component/documenti-component').then(
                (m) => m.DocumentiComponent,
              ),
          },
          {
            path: 'profilo',
            data: { incorporato: true },
            loadComponent: () =>
              import('./features/profilo/profilo-component/profilo-component').then(
                (m) => m.ProfiloComponent,
              ),
          },
        ],
      },
      { path: '**', component: PaginaNonTrovataComponent },
    ],
  },
];
