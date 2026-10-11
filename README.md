# progettoFE

**English** · [Italiano](README.it.md)

Web client of a white-label management platform for small hotels and B&Bs. One Angular app
serves the property's public website with online booking, the guest portal and the staff
back office.

The API is **progettoBE** (Node.js/Express). Code and translation keys use Italian domain
names (`prenotazioni`, `camere`, `pulizie`...), because the product targets Italian
hospitality.

![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A524-339933?logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Tests](https://img.shields.io/badge/tests-1017%20passing-2ea44f)
![License](https://img.shields.io/badge/license-proprietary-lightgrey)

---

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Theming and white-label](#theming-and-white-label)
- [Languages](#languages)
- [Quality and testing](#quality-and-testing)
- [Production build](#production-build)
- [Conventions](#conventions)
- [License](#license)

## Features

**Public website**

- Home, rooms and room types, the property, activities and local events, offers, verified
  reviews, FAQ and contacts. All content comes from the back office.
- Booking flow with an availability calendar, extras, discount codes and a live price
  summary.
- Online payment (Stripe or PayPal hosted checkout) or bank transfer, deposit or full
  amount.
- Guest account: registration, password reset, one-click email unsubscribe and legal
  documents.
- Live chat widget with the front desk.

**Guest portal**

- Bookings, with extras, cancellation and payment of the balance.
- Online check-in before arrival.
- Invoices, loyalty level and points, identity documents and profile.

**Staff back office**

- Dashboard, reports and today's arrivals and departures.
- Bookings, room planning and guests.
- Rooms, services, rates (plans, seasons, promotions, discount codes, packages) and
  housekeeping with checklists.
- Alloggiati Web, payments, invoices and maintenance.
- Site content, FAQ and review moderation.
- Users, roles and permissions, activity log, settings and external calendars (iCal).
- Staff chat with groups, plus in-app notifications.

Every page is **mobile-first** and works on phones, tablets and desktops. Each menu item
appears only to the roles that have the matching permission.

## Tech stack

| Area      | Choice                                                                  |
| --------- | ----------------------------------------------------------------------- |
| Framework | Angular 21: standalone components, signals, OnPush, new control flow    |
| UI        | Our own design system on Angular CDK and Angular Aria, CSS custom props |
| i18n      | Transloco, five languages                                               |
| Real time | socket.io-client                                                        |
| Fonts     | Fontsource (Young Serif, Figtree, Geist, Geist Mono), Material Symbols  |
| Quality   | Vitest + jsdom, ESLint (angular-eslint), Prettier, Husky + lint-staged  |

There is no UI component library: buttons, fields, dialogs and menus are built in the
project, so the look stays fully under control and every dependency has a permissive
license (MIT, Apache-2.0, ISC, BSD, OFL).

## Getting started

### Requirements

- Node.js 24 or newer
- progettoBE running locally on port 3000 (`npm run dev` there)

### Install and run

```bash
git clone <repository-url> progettoFE
cd progettoFE
npm install
npm start      # http://localhost:4200
```

In development the app calls the API on the same host as the page, port 3000
(`src/environments/environment.development.ts`). So a phone on the same network can open
`http://<computer-ip>:4200` and reach the API too.

With the progettoBE demo data loaded (`npm run seed` there) you can sign in with the demo
accounts. Their shared password is printed at the end of the seed.

## Scripts

| Command                  | What it does                                            |
| ------------------------ | ------------------------------------------------------- |
| `npm start`              | Development server on http://localhost:4200             |
| `npm run build`          | Production build in `dist/progettoFE/browser`           |
| `npm test`               | Unit tests (Vitest), single run                         |
| `npm run test:watch`     | Unit tests in watch mode                                |
| `npm run test:copertura` | Unit tests with coverage report                         |
| `npm run lint`           | ESLint on TypeScript and templates                      |
| `npm run format`         | Prettier on the whole project (`format:check` to check) |
| `npm run licenze`        | Fails if a dependency has a non-permissive license      |

## Project structure

```
src/
  app/
    core/services/<domain>/  services, interceptors, guards and constants of each domain
    features/
      pubblico/              public website pages
      prenotazione/          booking flow
      accesso/ profilo/      sign-in, registration, password, profile
      portale/               guest portal
      gestionale/            staff back office
    layout/                  public and staff shells, headers, menus, chat widget
    shared/models/<name>/    one model per file, with its spec
    shared/<component>/      reusable components, directives and pipes
  environments/              API URLs for development and production
  styles/                    design tokens and base CSS
public/i18n/                 translations (it, en, fr, de, es)
```

- One component per folder, with separate `.ts`, `.html`, `.css` and `.spec.ts` files.
- Models mirror the progettoBE responses: snake_case fields, dates as ISO strings,
  decimals as numbers.
- Allowed values (statuses, types, channels...) live in `*-costanti.ts` files, with the
  same values as the backend. Model types derive from them, so a new value is added in one
  place only.

## Theming and white-label

- Colors, fonts, radii and spacing are CSS custom properties `--bb-*` in
  [src/styles/token.css](src/styles/token.css).
- Every color has a light and a dark value through `light-dark()`. The system theme works
  without JavaScript; the theme switcher only forces a choice.
- The public website and the back office share the tokens but have their own look: warmer
  and more editorial for guests, plainer and denser for staff.
- The property's brand color comes from the back office settings and overrides
  `--bb-brand` at runtime. Name, logo and content come from the API too.

To restyle the app for a property, override the tokens, never the components.

## Languages

- Italian, English, French, German and Spanish, in `public/i18n/<lang>.json`.
- A test checks that every language has exactly the same keys as Italian.
- API error codes (for example `SINCRONIZZAZIONE_FALLITA`) are translated under `errori.*`.
- Dates, prices and countries are formatted for the active language through shared pipes.

## Quality and testing

- **1017 unit tests** (Vitest) cover services, components, pipes, guards and models.
- Git hooks run `lint-staged` on commit, and `npm run lint` plus `npm test` on push.
- GitHub Actions (`.github/workflows/ci.yml`) runs on every push and pull request to
  `develop`: install, license check, lint, format check, tests and production build.

## Production build

```bash
npm ci
npm run build    # output: dist/progettoFE/browser
```

The production build expects the API on the **same domain** (`/api`, `/media` and
`/socket.io`). Serve the static files behind the same reverse proxy as progettoBE:

- `/api`, `/media` and `/socket.io` (with WebSocket upgrade) go to the API;
- every other path serves `dist/progettoFE/browser`, falling back to `index.html` so that
  Angular routes work on reload.

The progettoBE README has the full deployment guide.

## Conventions

- **Language.** The domain is in Italian: files, classes, signals and translation keys.
- **Commits.** Messages follow Conventional Commits in Italian, for example
  `feat(listino): ...` or `fix(sito): ...`.
- **Branches.** Work happens on `feat/*`, `fix/*` and `docs/*` branches. Each one goes into
  `develop` through a pull request, and `master` holds releases.

## License

Proprietary software. Copyright © 2026 Marco Sabatini. All rights reserved. See
[LICENSE](LICENSE).
