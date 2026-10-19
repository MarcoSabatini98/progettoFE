# progettoFE

[English](README.md) · **Italiano** · API backend: [progettoBE](https://github.com/MarcoSabatini98/progettoBE)

Client web di una piattaforma gestionale white-label per piccoli hotel e B&B. Una sola app
Angular fa girare il sito pubblico della struttura con la prenotazione online, il portale
dell'ospite e il gestionale dello staff.

L'API è **progettoBE** (Node.js/Express). Codice e chiavi di traduzione usano nomi di
dominio in italiano (`prenotazioni`, `camere`, `pulizie`...), perché il prodotto è pensato
per l'ospitalità italiana.

![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A524-339933?logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Test](https://img.shields.io/badge/test-1017%20superati-2ea44f)
![Licenza](https://img.shields.io/badge/licenza-proprietaria-lightgrey)

---

## Indice

- [Funzionalità](#funzionalità)
- [Tecnologie](#tecnologie)
- [Avvio rapido](#avvio-rapido)
- [Script](#script)
- [Struttura del progetto](#struttura-del-progetto)
- [Tema e white-label](#tema-e-white-label)
- [Lingue](#lingue)
- [Qualità e test](#qualità-e-test)
- [Build di produzione](#build-di-produzione)
- [Convenzioni](#convenzioni)
- [Licenza](#licenza)

## Funzionalità

**Sito pubblico**

- Home, camere e tipologie, la struttura, attività ed eventi in zona, offerte, recensioni
  verificate, FAQ e contatti. Tutti i contenuti arrivano dal gestionale.
- Prenotazione con calendario delle disponibilità, servizi extra, codici sconto e
  riepilogo del prezzo sempre aggiornato.
- Pagamento online (checkout ospitato di Stripe o PayPal) o bonifico, in acconto o per
  intero.
- Account dell'ospite: registrazione, recupero password, disiscrizione dalle email in un
  clic e documenti legali.
- Widget di chat dal vivo con la reception.

**Portale dell'ospite**

- Prenotazioni, con servizi extra, cancellazione e pagamento del saldo.
- Check-in online prima dell'arrivo.
- Fatture, livello e punti fedeltà, documenti d'identità e profilo.

**Gestionale dello staff**

- Cruscotto, report e arrivi e partenze di oggi.
- Prenotazioni, planning delle camere e ospiti.
- Camere, servizi, tariffe (piani, stagioni, promozioni, codici sconto, pacchetti) e
  pulizie con checklist.
- Alloggiati Web, pagamenti, fatture e manutenzione.
- Contenuti del sito, FAQ e moderazione delle recensioni.
- Utenti, ruoli e permessi, registro delle attività, impostazioni e calendari esterni
  (iCal).
- Chat dello staff con i gruppi, più le notifiche nell'app.

Ogni pagina è **mobile-first** e funziona su telefono, tablet e desktop. Ogni voce di menu
compare solo ai ruoli che hanno il permesso corrispondente.

## Tecnologie

| Area        | Scelta                                                                   |
| ----------- | ------------------------------------------------------------------------ |
| Framework   | Angular 21: componenti standalone, signal, OnPush, nuovo control flow    |
| Interfaccia | Design system nostro su Angular CDK e Angular Aria, proprietà CSS custom |
| Traduzioni  | Transloco, cinque lingue                                                 |
| Tempo reale | socket.io-client                                                         |
| Font        | Fontsource (Young Serif, Figtree, Geist, Geist Mono), Material Symbols   |
| Qualità     | Vitest + jsdom, ESLint (angular-eslint), Prettier, Husky + lint-staged   |

Non c'è una libreria di componenti: pulsanti, campi, dialoghi e menu sono fatti nel
progetto. Così l'aspetto resta sotto controllo e ogni dipendenza ha una licenza permissiva
(MIT, Apache-2.0, ISC, BSD, OFL).

## Avvio rapido

### Requisiti

- Node.js 24 o più recente
- progettoBE avviato in locale sulla porta 3000 (`npm run dev` lì)

### Installazione e avvio

```bash
git clone <url-del-repository> progettoFE
cd progettoFE
npm install
npm start      # http://localhost:4200
```

In sviluppo l'app chiama l'API sullo stesso host della pagina, porta 3000
(`src/environments/environment.development.ts`). Così anche un telefono sulla stessa rete
può aprire `http://<ip-del-computer>:4200` e raggiungere l'API.

Con i dati di prova di progettoBE caricati (`npm run seed` lì) si entra con gli account di
prova. La loro password comune viene stampata alla fine del seed.

## Script

| Comando                  | Cosa fa                                                        |
| ------------------------ | -------------------------------------------------------------- |
| `npm start`              | Server di sviluppo su http://localhost:4200                    |
| `npm run build`          | Build di produzione in `dist/progettoFE/browser`               |
| `npm test`               | Test unitari (Vitest), una volta                               |
| `npm run test:watch`     | Test unitari in modalità watch                                 |
| `npm run test:copertura` | Test unitari con report di copertura                           |
| `npm run lint`           | ESLint su TypeScript e template                                |
| `npm run format`         | Prettier su tutto il progetto (`format:check` per controllare) |
| `npm run licenze`        | Fallisce se una dipendenza ha una licenza non permissiva       |

## Struttura del progetto

```
src/
  app/
    core/services/<dominio>/  service, interceptor, guard e costanti di ogni dominio
    features/
      pubblico/               pagine del sito pubblico
      prenotazione/           percorso di prenotazione
      accesso/ profilo/       accesso, registrazione, password, profilo
      portale/                portale dell'ospite
      gestionale/             gestionale dello staff
    layout/                   cornici pubblica e staff, intestazioni, menu, widget chat
    shared/models/<nome>/     un modello per file, con il suo spec
    shared/<componente>/      componenti, direttive e pipe riusabili
  environments/               URL dell'API per sviluppo e produzione
  styles/                     token del design system e CSS di base
public/i18n/                  traduzioni (it, en, fr, de, es)
```

- Un componente per cartella, con file `.ts`, `.html`, `.css` e `.spec.ts` separati.
- I modelli ricalcano le risposte di progettoBE: campi snake_case, date come stringhe ISO,
  decimali come number.
- I valori ammessi (stati, tipi, canali...) stanno nei file `*-costanti.ts`, con gli
  stessi valori del backend. I tipi dei modelli ne derivano, così un valore nuovo si
  aggiunge in un solo posto.

## Tema e white-label

- Colori, font, raggi e spaziature sono proprietà CSS `--bb-*` in
  [src/styles/token.css](src/styles/token.css).
- Ogni colore ha un valore chiaro e uno scuro con `light-dark()`. Il tema di sistema
  funziona senza JavaScript; il selettore del tema serve solo a forzare una scelta.
- Sito pubblico e gestionale condividono i token ma hanno un aspetto proprio: più caldo ed
  editoriale per gli ospiti, più sobrio e compatto per lo staff.
- Il colore della struttura arriva dalle impostazioni del gestionale e sovrascrive
  `--bb-brand` mentre l'app gira. Anche nome, logo e contenuti arrivano dall'API.

Per adattare lo stile a una struttura si sovrascrivono i token, mai i componenti.

## Lingue

- Italiano, inglese, francese, tedesco e spagnolo, in `public/i18n/<lingua>.json`.
- Un test controlla che ogni lingua abbia esattamente le stesse chiavi dell'italiano.
- I codici di errore dell'API (per esempio `SINCRONIZZAZIONE_FALLITA`) si traducono sotto
  `errori.*`.
- Date, prezzi e paesi si formattano nella lingua attiva con pipe condivise.

## Qualità e test

- **1017 test unitari** (Vitest) coprono service, componenti, pipe, guard e modelli.
- Hook git: `lint-staged` al commit; `npm run lint` e `npm test` al push.
- GitHub Actions (`.github/workflows/ci.yml`) parte a ogni push e pull request verso
  `develop`: installazione, controllo licenze, lint, controllo formattazione, test e build
  di produzione.

## Build di produzione

```bash
npm ci
npm run build    # risultato: dist/progettoFE/browser
```

La build di produzione si aspetta l'API sullo **stesso dominio** (`/api`, `/media` e
`/socket.io`). I file statici vanno serviti dietro lo stesso reverse proxy di progettoBE:

- `/api`, `/media` e `/socket.io` (con l'upgrade WebSocket) vanno all'API;
- tutti gli altri percorsi servono `dist/progettoFE/browser`, con ritorno a `index.html`
  così le rotte di Angular funzionano anche ricaricando la pagina.

La guida completa al deploy è nel README di progettoBE.

## Convenzioni

- **Lingua.** Il dominio è in italiano: file, classi, signal e chiavi di traduzione.
- **Commit.** I messaggi seguono Conventional Commits in italiano, per esempio
  `feat(listino): ...` o `fix(sito): ...`.
- **Branch.** Si lavora su branch `feat/*`, `fix/*` e `docs/*`. Ognuno entra in `develop`
  con una pull request, e `master` contiene i rilasci.

## Licenza

Software proprietario. Copyright © 2026 Marco Sabatini. Tutti i diritti riservati. Vedi
[LICENSE](LICENSE).
