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
        path: 'cruscotto',
        canActivate: [ruoloGuard],
        data: { permessi: [PERMESSI.ANALYTICS_LEGGI] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/cruscotto-component/cruscotto-component').then(
            (m) => m.CruscottoComponent,
          ),
      },
      {
        path: 'report',
        canActivate: [ruoloGuard],
        data: { permessi: [PERMESSI.ANALYTICS_LEGGI] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/report-component/report-component').then(
            (m) => m.ReportComponent,
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
        path: 'planning',
        canActivate: [ruoloGuard],
        data: { permessi: [PERMESSI.PRENOTAZIONI_LEGGI] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/planning-component/planning-component').then(
            (m) => m.PlanningComponent,
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
        path: 'servizi',
        canActivate: [ruoloGuard],
        data: { permessi: [PERMESSI.CAMERE_GESTISCI] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/servizi-component/servizi-component').then(
            (m) => m.ServiziComponent,
          ),
      },
      {
        path: 'pulizie',
        canActivate: [ruoloGuard],
        data: { permessi: [PERMESSI.PULIZIE_LEGGI] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/pulizie-component/pulizie-component').then(
            (m) => m.PulizieComponent,
          ),
      },
      {
        path: 'pulizie/checklist',
        canActivate: [ruoloGuard],
        data: { permessi: [PERMESSI.PULIZIE_GESTISCI] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/checklist-pulizie-component/checklist-pulizie-component').then(
            (m) => m.ChecklistPulizieComponent,
          ),
      },
      {
        path: 'pulizie/:id',
        canActivate: [ruoloGuard],
        data: { permessi: [PERMESSI.PULIZIE_LEGGI] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/scheda-pulizia-component/scheda-pulizia-component').then(
            (m) => m.SchedaPuliziaComponent,
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
      {
        path: 'tariffe',
        canActivate: [ruoloGuard],
        data: { permessi: [PERMESSI.TARIFFE_GESTISCI] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/tariffe-component/tariffe-component').then(
            (m) => m.TariffeComponent,
          ),
      },
      {
        path: 'contenuti',
        canActivate: [ruoloGuard],
        data: { permessi: [PERMESSI.CONTENUTI_GESTISCI] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/contenuti-component/contenuti-component').then(
            (m) => m.ContenutiComponent,
          ),
      },
      {
        path: 'faq',
        canActivate: [ruoloGuard],
        data: { permessi: [PERMESSI.FAQ_GESTISCI] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/gestione-faq-component/gestione-faq-component').then(
            (m) => m.GestioneFaqComponent,
          ),
      },
      {
        path: 'recensioni',
        canActivate: [ruoloGuard],
        data: { permessi: [PERMESSI.RECENSIONI_MODERA] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/moderazione-component/moderazione-component').then(
            (m) => m.ModerazioneComponent,
          ),
      },
      // Link della notifica di una recensione nuova.
      {
        path: 'recensioni/:id',
        canActivate: [ruoloGuard],
        data: { permessi: [PERMESSI.RECENSIONI_MODERA] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/moderazione-recensione-component/moderazione-recensione-component').then(
            (m) => m.ModerazioneRecensioneComponent,
          ),
      },
      {
        path: 'pagamenti',
        canActivate: [ruoloGuard],
        data: { permessi: [PERMESSI.PAGAMENTI_LEGGI] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/pagamenti-component/pagamenti-component').then(
            (m) => m.PagamentiComponent,
          ),
      },
      {
        path: 'fatture',
        canActivate: [ruoloGuard],
        data: { permessi: [PERMESSI.FATTURE_GESTISCI] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/fatture-component/fatture-component').then(
            (m) => m.FattureComponent,
          ),
      },
      {
        path: 'fatture/:id',
        canActivate: [ruoloGuard],
        data: { permessi: [PERMESSI.FATTURE_GESTISCI] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/scheda-fattura-component/scheda-fattura-component').then(
            (m) => m.SchedaFatturaComponent,
          ),
      },
      {
        path: 'utenti',
        canActivate: [ruoloGuard],
        data: { permessi: [PERMESSI.UTENTI_GESTISCI] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/utenti-component/utenti-component').then(
            (m) => m.UtentiComponent,
          ),
      },
      {
        path: 'utenti/:id',
        canActivate: [ruoloGuard],
        data: { permessi: [PERMESSI.UTENTI_GESTISCI] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/scheda-utente-component/scheda-utente-component').then(
            (m) => m.SchedaUtenteComponent,
          ),
      },
      // Solo admin: chi cambia i permessi potrebbe darsene di nuovi da solo.
      {
        path: 'ruoli',
        canActivate: [ruoloGuard],
        data: { ruoli: [RUOLI.ADMIN] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/ruoli-component/ruoli-component').then(
            (m) => m.RuoliComponent,
          ),
      },
      // Solo admin: chi ha cambiato cosa in prenotazioni, pagamenti e fatture.
      {
        path: 'registro',
        canActivate: [ruoloGuard],
        data: { ruoli: [RUOLI.ADMIN] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/registro-component/registro-component').then(
            (m) => m.RegistroComponent,
          ),
      },
      // Dati della struttura, orari, regole, aspetto del sito e logo.
      {
        path: 'impostazioni',
        canActivate: [ruoloGuard],
        data: { permessi: [PERMESSI.IMPOSTAZIONI_GESTISCI] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/impostazioni-component/impostazioni-component').then(
            (m) => m.ImpostazioniComponent,
          ),
      },
      // Con l'id (link della notifica di errore) apre quel calendario.
      {
        path: 'calendari',
        canActivate: [ruoloGuard],
        data: { permessi: [PERMESSI.CALENDARI_GESTISCI] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/calendari-component/calendari-component').then(
            (m) => m.CalendariComponent,
          ),
      },
      {
        path: 'calendari/:id',
        canActivate: [ruoloGuard],
        data: { permessi: [PERMESSI.CALENDARI_GESTISCI] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/calendari-component/calendari-component').then(
            (m) => m.CalendariComponent,
          ),
      },
      // Chi segnala vede le sue segnalazioni, chi gestisce le vede tutte (lo decide il backend).
      {
        path: 'manutenzione',
        canActivate: [ruoloGuard],
        data: { permessi: [PERMESSI.MANUTENZIONE_SEGNALA] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/manutenzione-component/manutenzione-component').then(
            (m) => m.ManutenzioneComponent,
          ),
      },
      {
        path: 'manutenzione/:id',
        canActivate: [ruoloGuard],
        data: { permessi: [PERMESSI.MANUTENZIONE_SEGNALA] } satisfies RequisitiAccessoInterface,
        loadComponent: () =>
          import('./features/gestionale/scheda-segnalazione-component/scheda-segnalazione-component').then(
            (m) => m.SchedaSegnalazioneComponent,
          ),
      },
      {
        // Chat interna: tutto lo staff. L'assistenza si vede solo con CHAT_ASSISTENZA.
        path: 'chat',
        loadComponent: () =>
          import('./features/gestionale/chat-component/chat-component').then(
            (m) => m.ChatComponent,
          ),
        children: [
          { path: '', children: [] },
          {
            path: 'nuova',
            loadComponent: () =>
              import('./features/gestionale/nuova-chat-component/nuova-chat-component').then(
                (m) => m.NuovaChatComponent,
              ),
          },
          {
            path: ':uuid',
            loadComponent: () =>
              import('./features/gestionale/conversazione-component/conversazione-component').then(
                (m) => m.ConversazioneComponent,
              ),
          },
        ],
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
