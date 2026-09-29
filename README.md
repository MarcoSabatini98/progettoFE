# progettoFE

Frontend Angular del gestionale per strutture ricettive: sito pubblico con prenotazione,
portale cliente e area gestionale dello staff. Si appoggia all'API di progettoBE.

## Requisiti

- Node 24
- progettoBE avviato in locale (`npm run dev`, porta 3000)

## Comandi

| Comando                  | Cosa fa                                      |
| ------------------------ | -------------------------------------------- |
| `npm start`              | Server di sviluppo su http://localhost:4200  |
| `npm test`               | Test unitari (Vitest), una volta             |
| `npm run test:watch`     | Test unitari in modalità watch               |
| `npm run test:copertura` | Test con report di copertura                 |
| `npm run lint`           | ESLint su TypeScript e template              |
| `npm run format`         | Prettier su tutto il progetto                |
| `npm run licenze`        | Blocca dipendenze con licenze non permissive |
| `npm run build`          | Build di produzione in `dist/`               |

Gli hook git eseguono lint-staged al commit e lint + test al push.

## Struttura

```
src/
  app/
    core/        costanti, i18n, interceptor e servizi applicativi
    shared/      modelli (uno per file) e componenti condivisi
  environments/  URL dell'API per sviluppo e produzione
  styles/        token del design system e base CSS
public/i18n/     traduzioni (it, en, fr, de, es)
```

## Tema e personalizzazione

Colori, font, raggi e spaziature sono token CSS `--bb-*` in `src/styles/token.css`,
con valori chiaro/scuro tramite `light-dark()`. Per adattare lo stile a una struttura
si sovrascrivono i token, non i componenti.
