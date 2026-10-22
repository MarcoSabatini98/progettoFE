// Produzione: il frontend e l'API stanno sullo stesso dominio, dietro lo stesso proxy
// (vercel.json inoltra /api e /media al backend su Render).
export const environment = {
  apiUrl: '/api',
  /** Immagini del sito: il backend le serve sotto /media, fuori dall'API. */
  mediaUrl: '',
  /** Chat in tempo reale: diretta al backend, il proxy di Vercel non inoltra i WebSocket. */
  socketUrl: 'https://hotel-le-querce-api.onrender.com',
};
