import type {
  GruppoMenuInterface,
  VoceMenuInterface,
} from '../../../shared/models/voce-menu/voce-menu-model';
import { PERMESSI, RUOLI } from '../ruoli/ruoli-costanti';

/** Radice dell'area staff: è anche il percorso dei link nelle email del backend. */
export const PERCORSO_STAFF = '/staff';

/** Percorsi delle pagine pubbliche e personali. */
export const PERCORSI_PUBBLICI = {
  home: '/',
  accesso: '/accesso',
  registrazione: '/registrazione',
  recuperoPassword: '/recupero-password',
  reimpostaPassword: '/reimposta-password',
  areaPersonale: '/area-personale',
  prenota: '/prenota',
  /**
   * Seguito dal codice: /prenotazioni/BB-2026-0012 (link nelle email del backend).
   * Stripe e PayPal rimandano a /prenotazioni/:codice/pagamento.
   */
  prenotazioni: '/prenotazioni',
  /** Seguito dallo slug per il dettaglio: /camere/doppia-vista-mare. */
  camere: '/camere',
  struttura: '/struttura',
  attivita: '/attivita',
  offerte: '/offerte',
  recensioni: '/recensioni',
  faq: '/faq',
  contatti: '/contatti',
  /** Seguito dal tipo: /documenti/privacy, /documenti/termini, /documenti/cookie. */
  documenti: '/documenti',
  /** Link nell'email prima dell'arrivo: /checkin-online?token=... */
  checkinOnline: '/checkin-online',
} as const;

/** Sezioni dell'area personale dei clienti. */
export const PERCORSI_PORTALE = {
  /** Seguito dall'id per il dettaglio: /area-personale/prenotazioni/12. */
  prenotazioni: `${PERCORSI_PUBBLICI.areaPersonale}/prenotazioni`,
  fatture: `${PERCORSI_PUBBLICI.areaPersonale}/fatture`,
  fedelta: `${PERCORSI_PUBBLICI.areaPersonale}/fedelta`,
  documenti: `${PERCORSI_PUBBLICI.areaPersonale}/documenti`,
  profilo: `${PERCORSI_PUBBLICI.areaPersonale}/profilo`,
} as const;

/** Schede dell'area personale, nell'ordine della barra. */
export const MENU_PORTALE: readonly VoceMenuInterface[] = [
  {
    etichetta: 'portale.menu.prenotazioni',
    percorso: PERCORSI_PORTALE.prenotazioni,
    icona: 'event_note',
  },
  { etichetta: 'portale.menu.fatture', percorso: PERCORSI_PORTALE.fatture, icona: 'receipt_long' },
  {
    etichetta: 'portale.menu.fedelta',
    percorso: PERCORSI_PORTALE.fedelta,
    icona: 'workspace_premium',
  },
  { etichetta: 'portale.menu.documenti', percorso: PERCORSI_PORTALE.documenti, icona: 'badge' },
  { etichetta: 'portale.menu.profilo', percorso: PERCORSI_PORTALE.profilo, icona: 'person' },
];

/** Menu del sito pubblico, nell'ordine della testata. */
export const MENU_PUBBLICO: readonly VoceMenuInterface[] = [
  { etichetta: 'menu.sito.camere', percorso: PERCORSI_PUBBLICI.camere, icona: 'bed' },
  { etichetta: 'menu.sito.struttura', percorso: PERCORSI_PUBBLICI.struttura, icona: 'villa' },
  { etichetta: 'menu.sito.attivita', percorso: PERCORSI_PUBBLICI.attivita, icona: 'explore' },
  { etichetta: 'menu.sito.offerte', percorso: PERCORSI_PUBBLICI.offerte, icona: 'sell' },
  { etichetta: 'menu.sito.recensioni', percorso: PERCORSI_PUBBLICI.recensioni, icona: 'reviews' },
  { etichetta: 'menu.sito.contatti', percorso: PERCORSI_PUBBLICI.contatti, icona: 'mail' },
];

/** Ricerca di un indirizzo sulle mappe: si apre in una nuova scheda, niente mappe incorporate (cookie di terze parti). */
export const URL_MAPPE = 'https://www.google.com/maps/search/?api=1&query=';

/** Account dello staff dentro il gestionale: stessa pagina dell'area personale. */
export const PERCORSO_ACCOUNT_STAFF = `${PERCORSO_STAFF}/account`;

/** Pagine del gestionale raggiunte anche da link e pulsanti, non solo dal menu. */
export const PERCORSI_STAFF = {
  cruscotto: `${PERCORSO_STAFF}/cruscotto`,
  oggi: `${PERCORSO_STAFF}/oggi`,
  /** Seguito dall'id per la scheda: /staff/prenotazioni/12. */
  prenotazioni: `${PERCORSO_STAFF}/prenotazioni`,
  nuovaPrenotazione: `${PERCORSO_STAFF}/prenotazioni/nuova`,
  /** Seguito dall'id per la scheda: /staff/ospiti/5. */
  ospiti: `${PERCORSO_STAFF}/ospiti`,
  alloggiati: `${PERCORSO_STAFF}/alloggiati`,
  /** Seguito dall'id per la scheda: /staff/camere/4. */
  camere: `${PERCORSO_STAFF}/camere`,
  /** Seguito dall'id per la scheda: /staff/camere/tipologie/2. */
  tipologie: `${PERCORSO_STAFF}/camere/tipologie`,
  servizi: `${PERCORSO_STAFF}/servizi`,
  /** Seguito dall'id per la scheda: /staff/pulizie/9 (link nelle notifiche del backend). */
  pulizie: `${PERCORSO_STAFF}/pulizie`,
  checklistPulizie: `${PERCORSO_STAFF}/pulizie/checklist`,
  /** Seguito dall'uuid per la conversazione: /staff/chat/<uuid> (link nelle notifiche). */
  chat: `${PERCORSO_STAFF}/chat`,
  nuovaChat: `${PERCORSO_STAFF}/chat/nuova`,
  manutenzione: `${PERCORSO_STAFF}/manutenzione`,
  recensioni: `${PERCORSO_STAFF}/recensioni`,
  pagamenti: `${PERCORSO_STAFF}/pagamenti`,
  /** Seguito dall'id per la scheda: /staff/fatture/<id> (link nelle notifiche). */
  fatture: `${PERCORSO_STAFF}/fatture`,
  report: `${PERCORSO_STAFF}/report`,
  /** Seguito dall'id per la scheda: /staff/utenti/3. */
  utenti: `${PERCORSO_STAFF}/utenti`,
  ruoli: `${PERCORSO_STAFF}/ruoli`,
  registro: `${PERCORSO_STAFF}/registro`,
  impostazioni: `${PERCORSO_STAFF}/impostazioni`,
} as const;

/**
 * Menu dell'area staff, raggruppato per momento di lavoro. Ogni voce compare
 * solo a chi ha i permessi (stessa regola del ruoloGuard sulle rotte).
 */
export const MENU_STAFF: readonly GruppoMenuInterface[] = [
  {
    etichetta: 'menu.gruppi.oggi',
    voci: [
      {
        etichetta: 'menu.voci.cruscotto',
        percorso: PERCORSI_STAFF.cruscotto,
        icona: 'dashboard',
        permessi: [PERMESSI.ANALYTICS_LEGGI],
      },
      // Senza cruscotto (reception) si comincia da qui.
      {
        etichetta: 'menu.voci.oggi',
        percorso: PERCORSI_STAFF.oggi,
        icona: 'today',
        permessi: [PERMESSI.PRENOTAZIONI_LEGGI],
      },
      {
        etichetta: 'menu.voci.pulizie',
        percorso: PERCORSI_STAFF.pulizie,
        icona: 'cleaning_services',
        permessi: [PERMESSI.PULIZIE_LEGGI],
      },
      { etichetta: 'menu.voci.chat', percorso: PERCORSI_STAFF.chat, icona: 'chat' },
      {
        etichetta: 'menu.voci.manutenzione',
        percorso: PERCORSI_STAFF.manutenzione,
        icona: 'build',
        permessi: [PERMESSI.MANUTENZIONE_SEGNALA],
      },
    ],
  },
  {
    etichetta: 'menu.gruppi.soggiorni',
    voci: [
      {
        etichetta: 'menu.voci.prenotazioni',
        percorso: PERCORSI_STAFF.prenotazioni,
        icona: 'event_note',
        permessi: [PERMESSI.PRENOTAZIONI_LEGGI],
      },
      {
        etichetta: 'menu.voci.planning',
        percorso: `${PERCORSO_STAFF}/planning`,
        icona: 'calendar_month',
        permessi: [PERMESSI.PRENOTAZIONI_LEGGI],
      },
      {
        etichetta: 'menu.voci.ospiti',
        percorso: PERCORSI_STAFF.ospiti,
        icona: 'group',
        permessi: [PERMESSI.OSPITI_GESTISCI],
      },
      {
        etichetta: 'menu.voci.alloggiati',
        percorso: PERCORSI_STAFF.alloggiati,
        icona: 'badge',
        permessi: [PERMESSI.ALLOGGIATI_INVIA],
      },
    ],
  },
  {
    etichetta: 'menu.gruppi.struttura',
    voci: [
      {
        etichetta: 'menu.voci.camere',
        percorso: PERCORSI_STAFF.camere,
        icona: 'bed',
        permessi: [PERMESSI.CAMERE_GESTISCI],
      },
      {
        etichetta: 'menu.voci.servizi',
        percorso: PERCORSI_STAFF.servizi,
        icona: 'room_service',
        permessi: [PERMESSI.CAMERE_GESTISCI],
      },
      {
        etichetta: 'menu.voci.tariffe',
        percorso: `${PERCORSO_STAFF}/tariffe`,
        icona: 'sell',
        permessi: [PERMESSI.TARIFFE_GESTISCI],
      },
      {
        etichetta: 'menu.voci.calendari',
        percorso: `${PERCORSO_STAFF}/calendari`,
        icona: 'sync',
        permessi: [PERMESSI.CALENDARI_GESTISCI],
      },
      {
        etichetta: 'menu.voci.contenuti',
        percorso: `${PERCORSO_STAFF}/contenuti`,
        icona: 'photo_library',
        permessi: [PERMESSI.CONTENUTI_GESTISCI],
      },
      {
        etichetta: 'menu.voci.faq',
        percorso: `${PERCORSO_STAFF}/faq`,
        icona: 'help',
        permessi: [PERMESSI.FAQ_GESTISCI],
      },
      {
        etichetta: 'menu.voci.recensioni',
        percorso: PERCORSI_STAFF.recensioni,
        icona: 'reviews',
        permessi: [PERMESSI.RECENSIONI_MODERA],
      },
    ],
  },
  {
    etichetta: 'menu.gruppi.cassa',
    voci: [
      {
        etichetta: 'menu.voci.pagamenti',
        percorso: PERCORSI_STAFF.pagamenti,
        icona: 'payments',
        permessi: [PERMESSI.PAGAMENTI_LEGGI],
      },
      {
        etichetta: 'menu.voci.fatture',
        percorso: PERCORSI_STAFF.fatture,
        icona: 'receipt_long',
        permessi: [PERMESSI.FATTURE_GESTISCI],
      },
    ],
  },
  {
    etichetta: 'menu.gruppi.direzione',
    voci: [
      {
        etichetta: 'menu.voci.report',
        percorso: PERCORSI_STAFF.report,
        icona: 'monitoring',
        permessi: [PERMESSI.ANALYTICS_LEGGI],
      },
      {
        etichetta: 'menu.voci.utenti',
        percorso: PERCORSI_STAFF.utenti,
        icona: 'manage_accounts',
        permessi: [PERMESSI.UTENTI_GESTISCI],
      },
      {
        etichetta: 'menu.voci.ruoli',
        percorso: PERCORSI_STAFF.ruoli,
        icona: 'admin_panel_settings',
        ruoli: [RUOLI.ADMIN],
      },
      {
        etichetta: 'menu.voci.registro',
        percorso: PERCORSI_STAFF.registro,
        icona: 'history',
        ruoli: [RUOLI.ADMIN],
      },
      {
        etichetta: 'menu.voci.impostazioni',
        percorso: PERCORSI_STAFF.impostazioni,
        icona: 'settings',
        permessi: [PERMESSI.IMPOSTAZIONI_GESTISCI],
      },
    ],
  },
];
