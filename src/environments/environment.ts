// Produzione: il frontend e l'API stanno sullo stesso dominio, dietro lo stesso proxy.
export const environment = {
  apiUrl: '/api',
  /** Immagini del sito: il backend le serve sotto /media, fuori dall'API. */
  mediaUrl: '',
};
