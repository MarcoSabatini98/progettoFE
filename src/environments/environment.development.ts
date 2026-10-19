// Sviluppo: il backend gira con `npm run dev` su progettoBE, sullo stesso computer
// del frontend. Stesso host della pagina: da un telefono sulla stessa rete
// (http://<IP del computer>:4200) l'API è http://<IP del computer>:3000.
const backend = `http://${location.hostname}:3000`;

export const environment = {
  apiUrl: `${backend}/api`,
  /** Immagini del sito: il backend le serve sotto /media, fuori dall'API. */
  mediaUrl: backend,
};
