/**
 * Pagamento online avviato: si apre url (Stripe o PayPal), che poi rimanda a
 * /prenotazioni/:codice/pagamento?esito=ok|annullato.
 */
export interface CheckoutInterface {
  pagamento_id: number;
  uuid: string;
  importo: number;
  url: string;
}
