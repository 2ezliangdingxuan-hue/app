# GatherEase

An event management app for creating events, inviting/checking in guests via emailed QR codes, and scanning those codes at the door. Built with React Router v8 (SSR) and a small Express API backed by a flat-file JSON store.

## Getting Started

```bash
npm install          # install dependencies
npm run dev           # runs both the Vite (HTTPS) frontend and the Express API concurrently
npm run dev:server    # run only the Express API server (server/server.js), loads .env
npm run build          # production build
npm run start           # serve the production build
npm run typecheck      # regenerate React Router types then run tsc
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

### Env File:

```bash
SMTP_USER=YourEmail@Gmail.com
SMTP_PASS=Your google email App password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
```
`.env` (not committed) must supply `SMTP_USER` / `SMTP_PASS` for guest invite emails.


There is no automated test suite configured in this repo — the test cases below are a manual QA reference.

---

## Test Cases

Legend: **Pre-req** = state needed before the step is meaningful. All server-side validation refers to `server/server.js`.

### Auth

#### `/sign-up`

| # | Case | Steps | Expected |
|---|------|-------|----------|
| 1 | Happy path | Fill Name, Email, Phone, Password (≥6 chars) → Submit | 201; toast "Account created successfully! Please sign in."; redirected to `/sign-in` |
| 2 | Empty required field | Leave Name/Email/Password blank → Submit | Blocked by HTML5 `required` validation, no request sent |
| 3 | Missing phone number | Fill Name/Email/Password, leave Phone blank → Submit | ⚠️ Server rejects with 400 "All account fields are required" even though the UI labels phone "(Optional)" |
| 4 | Duplicate email | Sign up twice with the same email (any letter casing) | Second attempt: 409 "An account with that email already exists" |
| 5 | Password < 6 chars | Enter a 3-character password | Blocked client-side via `minLength={6}`; not enforced server-side if bypassed |
| 6 | Malformed email | Enter `notanemail` as email | No server-side format check — account is created regardless |
| 7 | API unreachable | Stop `dev:server`, submit the form | Toast "Account creation failed.", no crash |

#### `/sign-in`

| # | Case | Steps | Expected |
|---|------|-------|----------|
| 1 | Happy path | Correct email + password → Submit | Toast "Welcome back!"; redirected to `/`; header shows account name |
| 2 | Wrong password | Correct email, wrong password | 401 "Invalid email or password" |
| 3 | Unknown email | Email not registered | Same 401 message (no user enumeration) |
| 4 | Session persistence | Sign in → refresh page | `authToken` in localStorage → `GET /api/me` restores session automatically |
| 5 | Corrupted token | Sign in, manually corrupt `authToken` in localStorage → refresh | Falls back to signed-out state without crashing |
| 6 | Sign out | Sign in → open `UserMenu` → "Log out" | Token cleared, header reverts to signed-out state |

### Home & misc pages

| Route | Case | Expected |
|-------|------|----------|
| `/` (`routes/home.tsx`) | Load while signed out / signed in | Renders `Header` + `Welcome`; header reflects auth state |
| `/page` (Tetris minigame, unrelated to events) | Arrow keys move/rotate, Space hard-drops, Shift holds | Piece responds to input; game stops on top-out; "New" button resets board |
| `/form/:eventId` (`routes/form.tsx`) | Load with valid/invalid `:eventId` | Renders `Form` component (guest self-registration form) |

### `/events` — Managed Events dashboard

| # | Case | Pre-req | Expected |
|---|------|---------|----------|
| 1 | Signed out | none | Empty state: "Sign In to View Your Events" + CTA to `/sign-in` |
| 2 | Signed in, no events | account with empty `eventIds`/no collaborations | Empty state: "No Events Hosted Yet" + CTA to `/createEvent` |
| 3 | Signed in, owns events | `account.eventIds` non-empty | Cards render for each owned event (title, date, location, image) |
| 4 | Signed in, collaborator only | account listed in another event's `collaboratorIds` | Event appears in the list even though not in `eventIds` |
| 5 | Card navigation | — | Clicking a card navigates to `/events/:encryptedId` |

### `/createEvent`

| # | Case | Steps | Expected |
|---|------|-------|----------|
| 1 | Happy path | Fill Title, Description, Date, Capacity, Location, Category → Submit | 201; toast success; redirected to `/events/:eventId` |
| 2 | Not signed in | No token, submit | Server: 401 "Invalid or expired session" (client should ideally block earlier — verify UX) |
| 3 | Missing required field | Omit Title/Description/Date/Capacity/Location/Category | Blocked client-side (`required`); server also 400s "All event fields are required" if bypassed |
| 4 | Non-numeric capacity | Enter non-numeric value (bypass `type=number`) | Server 400 (`Number.isNaN(maxGuests)`) |
| 5 | No image uploaded | Leave Cover Image blank → Submit | Event created with the default placeholder banner |
| 6 | Image uploaded | Choose an image file | Preview shown; submitted as base64 data URL in `img` |
| 7 | Cancel | Click "Cancel" link | Navigates back to `/events` without creating anything |

### `/events/:eventId` (layout) + `/events/:eventId` index — Event Home

| # | Case | Expected |
|---|------|----------|
| 1 | Valid encrypted eventId | Loader resolves event; renders `EventHome` + nested `Outlet` |
| 2 | Invalid/garbage eventId | Loader throws 404 Response — verify a friendly 404 page renders, not a raw error |
| 3 | Non-owner/non-collaborator visits directly via URL | ⚠️ No ownership check exists in the loader or any nested route (`eventDetails`, `invite`, `guestList`, etc.) — any signed-in *or signed-out* user with the encrypted link can view and edit the event. Confirm whether this is intentional or a gap to close. |

#### `events/eventDetails.tsx` (index tab)

| # | Case | Steps | Expected |
|---|------|-------|----------|
| 1 | Edit capacity | Click capacity → change value → Save | `PUT /api/events/:id`; UI updates optimistically from local `events` cache |
| 2 | Edit category | Click category → select new option → Save | Category updates |
| 3 | Edit date / location / description | Click pencil → edit → Save | Field updates; Cancel discards draft |
| 4 | Long description | Description > 320 chars | "Read more" / "Show less" toggle appears |
| 5 | Upload new banner image | Click image edit icon → choose file → Save Image | Image preview updates immediately (base64), persisted via `PUT` |
| 6 | Copy public link | Click "Copy Public Link" | Clipboard gets `/view/:encryptedId`; toast confirms |
| 7 | Open public page | Click "View Public Page" | Opens `/view/:eventId` in a new tab |
| 8 | Open QR Scanner shortcut | Click "Open QR Scanner" | Navigates to `/scanner` |

#### `events/invite.tsx` — Direct Guest Invite

| # | Case | Steps | Expected |
|---|------|-------|----------|
| 1 | Add guest, happy path | Fill Name + Email (required), Phone/Remarks optional → Submit | `POST /newguest`; toast success; QR code (`eventId:guestId`) rendered on screen; invite email attempted via `sendGuestInviteEmail` |
| 2 | Empty name | Leave Name blank → Submit | Client-side toast "Please enter a guest name." (before hitting the API); server would also 400 |
| 3 | Email send failure | Invalid/unreachable SMTP creds | Guest is still created (email failure is caught & logged server-side, not surfaced to client) — verify guest still appears in guest list despite no email |
| 4 | Copy public sign-up link | Click copy in the "Shareable Public Sign-Up Link" section | Link to `/view/:eventId` (or equivalent) copied |

#### `events/guestList.tsx`

| # | Case | Steps | Expected |
|---|------|-------|----------|
| 1 | Search | Type into search box | Filters by name/email/number/remarks (case-insensitive) |
| 2 | Filter tiles/pills | Click "Arrived" / "Not Arrived" / "Total" stat tiles or filter pills | List filtered accordingly; active filter highlighted |
| 3 | RSVP filter pills | Click "RSVP Going" / "Declined" / "Pending" | List filtered by `guest.rsvp` |
| 4 | Manual check-in toggle | Click "Check In" then "Undo" on a guest row | `POST /check-in/:guestId` toggles `arrived`/`status`/`arrivalTime`; UI updates optimistically |
| 5 | Edit guest | Click pencil icon on a guest → edit modal opens | See `EditGuestFloat` test cases below |
| 6 | Invite guest (modal) | Click "Invite Guest" | Opens `InviteForm` float; submitting adds a guest and refreshes the list |
| 7 | CSV import — happy path | Upload a `.csv` with `name`,`email` columns | All rows imported sequentially via `addGuest`; success toast with count |
| 8 | XLSX import — happy path | Upload a `.xlsx` with `name`,`email` columns | Same as above via SheetJS parsing |
| 9 | Import — missing columns | Upload a file without a `name` or `email` header | Error toast + inline message: `must include a "name" and an "email" column` |
| 10 | Import — empty file | Upload an empty CSV/XLSX | Error: "The CSV/XLSX file is empty." |
| 11 | Import — rows with no name | All rows missing a name value | Error: "No valid guest rows found..." |
| 12 | Import — quoted/comma-containing CSV fields | CSV field like `"Smith, John"` | Custom `parseCsv` correctly keeps the quoted comma inside one field |
| 13 | Export CSV | Click "Export CSV" with guests present | Downloads a CSV matching current filter/search (`visibleGuests`), correctly escaping quotes/commas/newlines |
| 14 | Export CSV with zero guests | No guests match filter | Button disabled |
| 15 | Desktop vs mobile layout | Resize viewport across `sm` breakpoint | Table view (desktop) vs card view (mobile) both function identically |

#### `events/editGuestFloat.tsx` (Edit Guest modal)

| # | Case | Steps | Expected |
|---|------|-------|----------|
| 1 | Edit fields | Change Name/Email/Phone/RSVP/Remarks → "Save Guest Details" | `PUT /api/:eventId/:guestId/editGuest`; toast success; modal closes |
| 2 | Save failure | API down | Toast "Failed to update guest." |
| 3 | Remove guest | Click "Remove Guest" → confirm browser dialog | `DELETE /api/:eventId/:guestId/deleteGuest`; toast "Guest removed from event." |
| 4 | Remove guest — cancel confirm | Click "Remove Guest" → dismiss confirm dialog | No request sent, guest remains |
| 5 | Modal dismissal via backdrop | Click outside the modal | Closes via `Modal`'s backdrop mousedown handler without losing an in-progress text selection drag |
| 6 | Modal dismissal via Escape | Press `Esc` | Closes (global keydown handler in `Modal`) |

#### `events/rsvp.tsx` — RSVP Responses (host view)

| # | Case | Steps | Expected |
|---|------|-------|----------|
| 1 | Stat tile filters | Click Going/Declined/Pending tiles | Filters guest table; toggling the same tile resets to "All" |
| 2 | Search | Type guest name/email | Filters combined with active status filter |
| 3 | Copy personal RSVP link | Click "Copy RSVP Link" for a guest | Clipboard gets `/rsvp/:encryptedEventId/:encryptedGuestId`; button label flips to "Copied!" for 2s |
| 4 | Empty state | No guests match filters | "No RSVP records found matching your filters." |

#### `events/edit.tsx`, `activities.tsx`, `gifts.tsx`, `ratings.tsx`

| Route | Expected |
|-------|----------|
| `edit` | Static `EmptyState` pointing users to the event home's inline pencil icons |
| `activities` | "Activities coming soon" placeholder (feature not implemented) |
| `gifts` | "Gift registry coming soon" placeholder |
| `ratings` | "Ratings coming soon" placeholder |

#### `events/collaborators.tsx`

| # | Case | Pre-req | Expected |
|---|------|---------|----------|
| 1 | Load as owner | signed in as event owner | Owner card shown; "Invite a Collaborator" form visible |
| 2 | Load as collaborator | signed in as an existing collaborator | Same manage permissions as owner (`isManager` true) |
| 3 | Load as unrelated account | signed in, not owner/collaborator | Read-only: "Only the event owner or an active collaborator can invite teammates."; no Remove buttons for others |
| 4 | Invite by email — happy path | manager submits a registered teammate's email | `POST /collaborators`; 201; toast; list refreshes |
| 5 | Invite unknown email | email not registered | 404 "No account found with that email" |
| 6 | Invite the owner's own email | — | 400 "This account already owns the event" |
| 7 | Invite already-added collaborator | — | 400 "This account is already a collaborator" |
| 8 | Invite while unauthenticated/non-manager (API level) | forged request without a valid manager token | 403 "Only the owner or a collaborator can invite collaborators" |
| 9 | Remove another collaborator | as manager | `DELETE /collaborators/:accountId`; toast; list refreshes |
| 10 | Remove self ("Leave") | as a collaborator (not owner) | Self-removal allowed even for non-managers (`isSelfRemoval` bypass) |
| 11 | Remove without permission (API level) | non-manager tries to remove someone else | 403 |

### `/view/:eventId` — Public Event Page (`eventView.tsx`)

| # | Case | Expected |
|---|------|----------|
| 1 | Valid event | Renders hero image, date/location/capacity cards, description, "Register Now" |
| 2 | Invalid event id | "Event Not Found" + link back to `/` |
| 3 | Register Now → Sign-Up modal | Opens `SignUpForm` (`signUpFloat.tsx`); submitting calls `addGuest(..., { selfSignup: true })` → guest created with `rsvp: "Going"` immediately (per `server.js:349`) |
| 4 | Sign-up failure | API error | Toast "Failed to complete sign-up."; error re-thrown to the modal |
| 5 | "Add to Calendar" link | Event has a valid date | Opens a correctly parameterized Google Calendar URL in a new tab |
| 6 | "Add to Calendar" with invalid/blank date | `date` unparsable | Link omits the `&dates=` param gracefully (no crash) |
| 7 | "Open in Maps" link | Event has a location | Opens Google Maps search in a new tab; hidden entirely when no location |
| 8 | Capacity bar | `maxGuests` set, guests added | Percentage bar and "spots left" update; capped at 100% even if overbooked |
| 9 | No capacity set | `maxGuests` is 0/unset | Shows "Open Capacity", no progress bar |

### `/rsvp/:eventId/:guestId` — Guest RSVP response page (`rsvpResponse.tsx`)

| # | Case | Expected |
|---|------|----------|
| 1 | Valid link, first response | Loading spinner → guest/event details render → click "Yes, I'm Going" or "Can't Make It" |
| 2 | Submit "Going" | `POST /guest/:guestId/rsvp` with `Going`; confirmation screen: "Thank you, {name}!... Going" |
| 3 | Submit "Declined" | Same flow, confirmation shows "Declined" |
| 4 | Change response after submitting | Click "Change your response" | Returns to the Yes/No buttons, current status shown, can resubmit |
| 5 | Invalid/garbage encrypted eventId or guestId | `getGuestRsvp` returns not-ok | "Invitation Not Found" state |
| 6 | Guest ID valid but doesn't belong to the event | Server 404 "Guest not found" | Same "Invitation Not Found" UI |
| 7 | Re-open the same link later | Previously "Going" | Loads with `rsvp: "Going"` reflected as current status |

### `/scanner` — QR Door Scanner (`qrScan.tsx`)

| # | Case | Pre-req | Expected |
|---|------|---------|----------|
| 1 | Not signed in | signed out | Event dropdown has no selectable events (ownership filter added — only `account.eventIds` / `collaboratorIds` events are listed) |
| 2 | Signed in, owns/collaborates on events | — | Dropdown lists only those events, not all events in the system |
| 3 | No event selected | `eventId === -1` | Placeholder empty state, camera not started |
| 4 | Select an event | choose from dropdown | Camera starts (`Html5Qrcode`), guestlist search box available |
| 5 | Scan a valid QR for the selected event | camera sees `eventId:guestId` matching current event | `checkInGuest` + `getGuest` called; success banner "Checked In: {name}"; toast; entry appended to session log |
| 6 | Scan a QR from a different event | mismatched `eventId` prefix | Error banner "Event Mismatch"; toast "QR code does not match this event." |
| 7 | Re-scan an already-checked-in guest (same session) | guest key already in `scannedKeysRef` | "Already Checked In" duplicate banner; no duplicate API call |
| 8 | Scan malformed payload | QR without a `:` separator | `guestEvent`/`guestId` parse oddly — verify this doesn't crash the scan loop |
| 9 | Manual lookup fallback | type into "Manual Check-In Lookup" search | Filters guests by name/email for the selected event; "Check In"/"Re-scan" button calls `handleScan` directly |
| 10 | Switch events mid-session | change dropdown while scanning | Camera restarts scoped to new event id; `lastScanResult` cleared |
| 11 | Session history persistence | scan a few guests → refresh page | `Scanned` list restored from `localStorage` |
| 12 | Clear history | click "Clear History" → confirm | Session list and `scannedKeysRef` cleared; `localStorage` key removed |
| 13 | Camera permission denied | deny browser camera prompt | Scanner fails to start; verify no unhandled crash (errors are swallowed via `.catch(console.error)` / empty error callback) |

---

## API Endpoints (Express, `server/server.js`, port 3001)

| Method & Path | Auth | Test cases |
|---|---|---|
| `GET /api/events` | none | Returns full events array (no filtering — confirms the frontend, not the API, enforces "your events only") |
| `POST /api/events` | Bearer token | 401 if missing/invalid token; 400 if any required field missing/invalid; 201 + pushes `newEvent.id` into `account.eventIds` on success |
| `PUT /api/events/:eventId` | none | 404 if event missing; partial updates only apply provided fields; ⚠️ no auth/ownership check — any client can edit any event by id |
| `PUT /api/:eventId/:guestId/editGuest` | none | 404 if guest missing; ⚠️ throws unhandled if `:eventId` doesn't exist (`event.guests` on `undefined`) — verify server doesn't crash |
| `DELETE /api/:eventId/:guestId/deleteGuest` | none | 404 event/guest not found; 200 + returns deleted guest on success |
| `GET /api/events/:id` | none | 404 if not found |
| `GET /api/events/:eventId/collaborators` | none | 404 if event missing; returns `owner` + `collaborators` (public fields only, no password) |
| `POST /api/events/:eventId/collaborators` | Bearer token, must manage event | See collaborator test cases above (403/400/404 paths) |
| `DELETE /api/events/:eventId/collaborators/:accountId` | Bearer token, manage-or-self | 403 if neither manager nor removing self |
| `GET /api/events/:eventId/guests` | none | ⚠️ crashes if `:eventId` doesn't exist (`event.guests` on `undefined`) |
| `POST /api/events/:eventId/newguest` | none | 404 event missing; 400 if name blank; creates guest, attempts email (failure swallowed), 201 |
| `POST /api/events/:eventId/check-in/:guestId` | none | 404 event/guest missing; toggles arrival state each call |
| `GET /api/events/:eventId/guest/:guestId/rsvp` | none | 404 event/guest missing; returns limited public guest+event fields |
| `POST /api/events/:eventId/guest/:guestId/rsvp` | none | 400 if `response` isn't `"Going"`/`"Declined"`; 404 event/guest missing |
| `GET /api/events/:eventId/guest/:guestId` | none | 404 event/guest missing |
| `POST /api/accounts` | none | See sign-up test cases above (400/409 paths) |
| `POST /api/sign-in` | none | 400 missing fields; 401 invalid credentials; 200 + signed token on success |
| `GET /api/me` | Bearer token | 401 missing/invalid/expired token or deleted account; 200 + account on success |

**Known gaps worth confirming with the team** (not asserted as bugs, flagged for decision):
- `PUT /api/events/:eventId`, `PUT/DELETE` guest routes, and `GET /api/events/:eventId/guests` have **no authentication or ownership check** — anyone with an event/guest id can read or mutate them.
- `GET /api/:eventId/guest.../editGuest` and `.../guests` will throw if `:eventId` doesn't match any event (`event.guests` accessed on `undefined`), since `event` isn't null-checked before use.
- Sign-up requires phone number server-side despite the UI marking it optional.
- No server-side email format or password-length validation.
