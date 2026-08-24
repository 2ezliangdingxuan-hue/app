# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install dependencies
npm run dev           # runs both the React Router dev server (Vite, HTTPS) and the Express API server concurrently
npm run dev:server    # run only the Express API server (server/server.js), loads env vars from .env
npm run build          # production build (react-router build)
npm run start           # serve the production build (react-router-serve ./build/server/index.js)
npm run typecheck      # regenerate React Router types then run tsc
```

There is no lint script and no test suite configured in this repo.

The Vite dev server runs over HTTPS (via `vite-plugin-mkcert`) and binds to all hosts (`server.host: true`), which is required for the QR scanner to access the camera on mobile devices over LAN. The Express API always listens on port `3001` regardless of environment.

## Architecture

This is a React Router v8 (framework mode, SSR enabled) app for creating events, inviting/checking in guests via emailed QR codes, and scanning those codes at the door. It is two separate Node processes that must both run for the app to work end-to-end:

1. **React Router app** (`app/`) — SSR frontend, routes defined in `app/routes.ts`.
2. **Express API** (`server/server.js`, port 3001) — flat-file JSON "database" at `src/events.json`, plus an email/QR service in `src/services/mailer.js`.

### Data flow

- `src/events.json` is the single source of truth, containing both an `events` array and an `accounts` array (despite the filename). `server/server.js` reads/writes the whole file on every request (`readFileSync`/`writeFileSync` — no real DB).
- `server/events.ts` and `server/accounts.ts` are the frontend's API client modules. They import `src/events.json` directly for initial/synchronous data (event lists shown before a fetch resolves) *and* export async functions (`getEvents`, `createEvent`, `updateEvent`, `addGuest`, `checkInGuest`, `getGuest`, `createAccount`) that call the Express API at `http://<hostname>:3001`. Note these functions also mutate the imported `events` array in place as an ad hoc client-side cache — there is no separate state management layer (no Redux/Zustand/React Query).
- Guests are stored per-event as a map keyed by guest ID (`event.guests[guestId]`), not an array. Guest IDs are assigned sequentially per-event by `findNextGuest` in `server/server.js`.
- When a guest is added (`POST /api/events/:eventId/newguest`), the server generates a QR code (`qrcode` package, payload is `"<eventId>:<guestId>"`) and emails it via nodemailer/Gmail SMTP (`sendGuestInviteEmail` in `src/services/mailer.js`, credentials from `SMTP_USER`/`SMTP_PASS` env vars). Email failures are caught and logged, not surfaced to the client.
- Check-in (`POST /api/events/:eventId/check-in/:guestId`) toggles `arrived`/`status`/`arrivalTime` on the guest record.

### Frontend structure

- `app/routes.ts` declares the route tree using `@react-router/dev/routes`. `routes/event.tsx` is a layout route (loader fetches the event by `params.eventId` from the imported JSON, not the API) with nested child routes: `invite`, `guestList`, `activities`, `gifts`, `ratings`, `edit`, `rsvp` — each implemented in `app/events/*.tsx` and rendered via `<Outlet context={{event}}/>`.
- `app/routes/*.tsx` are thin route entry points that mostly just render a component from a sibling top-level folder (`app/events/`, `app/user/`, `app/qrScan/`, `app/page/`) — the actual page implementation lives in those folders, not in `app/routes/`.
- `app/qrScan/qrScan.tsx` uses `html5-qrcode` to scan camera input, parses the `"<eventId>:<guestId>"` payload, and calls `checkInGuest`/`getGuest`. Scanned guests are cached to `localStorage` under the key `Scanned` so the scan session survives reloads.
- Styling is Tailwind CSS v4 (via `@tailwindcss/vite`, configured in `app/app.css` using `@theme`/`@import "tailwindcss"`, no separate `tailwind.config.js`).
- Path alias `~/*` maps to `app/*` (see `tsconfig.json`).

### Environment

- `.env` (not committed) must supply `SMTP_USER` / `SMTP_PASS` for email sending; loaded via `--env-file=.env` in `npm run dev:server` and `dotenv`/`configDotenv` elsewhere.
- Docker build (`Dockerfile`) is a standard multi-stage React Router build; it only packages the frontend build output — it does not start `server/server.js`, so the Express API needs to be run/deployed separately in that setup.
