# Habit Tracker PWA

A mobile-first Progressive Web App for tracking daily habits and building streaks.

## Project Overview

This app allows users to:
- Sign up and log in with email and password
- Create, edit, and delete habits
- Mark habits complete for today and track streaks
- Install as a PWA on mobile or desktop
- Use offline after first load (cached app shell)

All data is stored in the browser's `localStorage` — no external database or authentication service is used.

---

## Setup Instructions

### Prerequisites
- Node.js v18 or later
- npm

### Install dependencies
```bash
npm install
npx playwright install chromium
```

---

## Run Instructions

### Development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production build
```bash
npm run build
npm run start
```

---

## Test Instructions

### Unit tests (with coverage)
```bash
npm run test:unit
```

### Integration/component tests
```bash
npm run test:integration
```

### End-to-end tests (requires dev server running)
```bash
npm run test:e2e
```

### All tests
```bash
npm test
```

---

## Local Persistence Structure

All data is stored in `localStorage` under these keys:

| Key | Shape | Purpose |
|---|---|---|
| `habit-tracker-users` | `User[]` | All registered users |
| `habit-tracker-session` | `Session \| null` | Currently logged-in user |
| `habit-tracker-habits` | `Habit[]` | All habits for all users |

### User shape
```json
{ "id": "uuid", "email": "string", "password": "string", "createdAt": "ISO string" }
```

### Session shape
```json
{ "userId": "uuid", "email": "string" }
```

### Habit shape
```json
{
  "id": "uuid",
  "userId": "uuid",
  "name": "string",
  "description": "string",
  "frequency": "daily",
  "createdAt": "ISO string",
  "completions": ["YYYY-MM-DD"]
}
```

---

## PWA Support

PWA support is implemented via:

1. **`public/manifest.json`** — defines app name, icons, display mode, and theme color
2. **`public/sw.js`** — a service worker that caches the app shell on install and serves cached responses when offline
3. **`src/components/shared/ServiceWorkerRegistrar.tsx`** — registers the service worker on the client side
4. **Icons** at `public/icons/icon-192.png` and `public/icons/icon-512.png`

After the first load, the app shell is cached and the app will not hard-crash when offline.

---

## Trade-offs and Limitations

- **No real authentication** — passwords are stored in plain text in localStorage. This is intentional per the spec (local persistence only, no external auth).
- **No server-side rendering for protected routes** — session checks happen client-side, so there may be a brief flash before redirect on protected routes.
- **localStorage only** — data is lost if the user clears browser storage or uses a different browser/device.
- **Daily frequency only** — only `daily` habits are supported in this stage.

---

## Test File Map

| Test File | What It Verifies |
|---|---|
| `tests/unit/slug.test.ts` | `getHabitSlug` — slug generation from habit names |
| `tests/unit/validators.test.ts` | `validateHabitName` — name validation rules |
| `tests/unit/streaks.test.ts` | `calculateCurrentStreak` — streak calculation logic |
| `tests/unit/habits.test.ts` | `toggleHabitCompletion` — completion toggling logic |
| `tests/integration/auth-flow.test.tsx` | Signup/login forms — session creation, error messages |
| `tests/integration/habit-form.test.tsx` | Habit form — create, edit, delete, complete, streak update |
| `tests/e2e/app.spec.ts` | Full app flows — routing, auth, habits, PWA offline behavior |
