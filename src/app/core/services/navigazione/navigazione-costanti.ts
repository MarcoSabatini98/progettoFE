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
  offerte: '/offerte',
  recensioni: '/recensioni',
  faq: '/faq',
  contatti: '/contatti',
  /** Seguito dal tipo: /documenti/privacy, /documenti/termini, /documenti/cookie. */
  documenti: '/documenti',
} as const;

/** Menu del sito pubblico, nell'ordine della testata. */
export const MENU_PUBBLICO: readonly VoceMenuInterface[] = [
  { etichetta: 'menu.sito.prenota', percorso: PERCORSI_PUBBLICI.prenota, icona: 'event_available' },
  { etichetta: 'menu.sito.camere', percorso: PERCORSI_PUBBLICI.camere, icona: 'bed' },
  { etichetta: 'menu.sito.offerte', percorso: PERCORSI_PUBBLICI.offerte, icona: 'sell' },
  { etichetta: 'menu.sito.recensioni', percorso: PERCORSI_PUBBLICI.recensioni, icona: 'reviews' },
  { etichetta: 'menu.sito.faq', percorso: PERCORSI_PUBBLICI.faq, icona: 'help' },
  { etichetta: 'menu.sito.contatti', percorso: PERCORSI_PUBBLICI.contatti, icona: 'mail' },
];

/** Ricerca di un indirizzo sulle mappe: si apre in una nuova scheda, niente mappe incorporate (cookie di terze parti). */
export const URL_MAPPE = 'https://www.google.com/maps/search/?api=1&query=';

/** Account dello staff dentro il gestionale: stessa pagina dell'area personale. */
export const PERCORSO_ACCOUNT_STAFF = `${PERCORSO_STAFF}/account`;

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
        percorso: `${PERCORSO_STAFF}/cruscotto`,
        icona: 'dashboard',
        permessi: [PERMESSI.ANALYTICS_LEGGI],
      },
      {
        etichetta: 'menu.voci.pulizie',
        percorso: `${PERCORSO_STAFF}/pulizie`,
        icona: 'cleaning_services',
        permessi: [PERMESSI.PULIZIE_LEGGI],
      },
      { etichetta: 'menu.voci.chat', percorso: `${PERCORSO_STAFF}/chat`, icona: 'chat' },
      {
        etichetta: 'menu.voci.manutenzione',
        percorso: `${PERCORSO_STAFF}/manutenzione`,
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
        percorso: `${PERCORSO_STAFF}/prenotazioni`,
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
        percorso: `${PERCORSO_STAFF}/ospiti`,
        icona: 'group',
        permessi: [PERMESSI.OSPITI_GESTISCI],
      },
      {
        etichetta: 'menu.voci.alloggiati',
        percorso: `${PERCORSO_STAFF}/alloggiati`,
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
        percorso: `${PERCORSO_STAFF}/camere`,
        icona: 'bed',
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
        percorso: `${PERCORSO_STAFF}/recensioni`,
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
        percorso: `${PERCORSO_STAFF}/pagamenti`,
        icona: 'payments',
        permessi: [PERMESSI.PAGAMENTI_LEGGI],
      },
      {
        etichetta: 'menu.voci.fatture',
        percorso: `${PERCORSO_STAFF}/fatture`,
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
        percorso: `${PERCORSO_STAFF}/report`,
        icona: 'monitoring',
        permessi: [PERMESSI.ANALYTICS_LEGGI],
      },
      {
        etichetta: 'menu.voci.utenti',
        percorso: `${PERCORSO_STAFF}/utenti`,
        icona: 'manage_accounts',
        permessi: [PERMESSI.UTENTI_GESTISCI],
      },
      {
        etichetta: 'menu.voci.ruoli',
        percorso: `${PERCORSO_STAFF}/ruoli`,
        icona: 'admin_panel_settings',
        ruoli: [RUOLI.ADMIN],
      },
      {
        etichetta: 'menu.voci.registro',
        percorso: `${PERCORSO_STAFF}/registro`,
        icona: 'history',
        ruoli: [RUOLI.ADMIN],
      },
      {
        etichetta: 'menu.voci.impostazioni',
        percorso: `${PERCORSO_STAFF}/impostazioni`,
        icona: 'settings',
        permessi: [PERMESSI.IMPOSTAZIONI_GESTISCI],
      },
    ],
  },
];
