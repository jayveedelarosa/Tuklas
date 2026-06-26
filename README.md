# Tuklas

A gamified, fully-offline mobile app that wraps DepEd Grade 1 math practice (Quarter 1, Numbers and Number Sense) inside a Philippine-folklore monster-battle game, paired with an adaptive Pomodoro focus timer.

## Team — Haribirds

- Jersylle Hannah Nismal
- Enzo Lorzano
- Roel Aquino
- Jayvee Dela Rosa

## What's built

A complete vertical slice, playable end to end:

- **Onboarding** — 3 pre-seeded player profiles (Player 1 & 2: all 3 levels beaten, full adherence history; Player 3: levels 1–2 done, drops fresh into Level 3).
- **Map** — 15 level nodes; only Level 3 ("Bukid ng Bayabas", vs. Kapre) is playable, levels 4–15 are visible but locked/coming-soon.
- **Phase 2 — Interactive Learning** — a 5-beat calm primer (unsorted pile → auto-grouping into tens → leftover ones → equation read-out → "Let's go") built from Module 3's santol-grouping example, with a hardcoded-response chatbot icon.
- **Battle Loop** — a 5-question DepEd-aligned regrouping quiz against Kapre. Wrong answers retry (no hard fail); the **Adaptive Learning Engine** (Elo-based difficulty, derived hint frequency) adjusts live and surfaces a mandatory on-screen "Tuklas noticed..." banner (English + Tagalog) every time it acts.
- **Pomodoro + adherence tracking** — adaptive session/break length (bounded around the 25/5 Cirillo baseline), streak counter, and a calendar heatmap of session history.
- **Character roster** — Tikbalang / Aswang / Kapre, locked vs. unlocked.
- Every English UI string ships with a Tagalog line beneath it, in the same mixed register used by the source DepEd modules.

### Question content

All three DepEd Grade 1 modules are bundled as separate, independently-loadable question banks (`app/features/topics/data/*.json`) seeded from the modules' own word problems — Mary's palengke fruit basket and Karl & Andria's mango regrouping (Module 3), Lina & Karla's mango one-more/one-less story (Module 2), and Lorna's bookstore numeral/word exercise (Module 1). The playable Level 3 battle draws from the regrouping bank; number-sense and one-more-one-less ship bundled (and are covered by the data-layer tests) but aren't yet wired into a second playable level, since only Level 3 is in scope for this build (see Known limitations).

## Tech stack

- React Native + Expo (TypeScript), Expo Go-compatible
- React Navigation (native-stack)
- Zustand for in-memory session state
- No backend, no auth, no persistence — fully local, offline by design
- Jest + jest-expo + React Native Testing Library

## Setup

Requirements: **Node 18+** (developed on Node 22), npm, and the **Expo Go** app on a physical Android/iOS device (or an emulator/simulator).

```bash
npm install
```

## Running the app

**On a physical device (recommended for the airplane-mode test):**

```bash
npm start
```

Scan the QR code with the Expo Go app. Once loaded, you can switch the device to airplane mode — the app has no network dependency and will keep working.

**On an emulator/simulator:**

```bash
npm run android   # Android emulator
npm run ios        # iOS simulator (macOS only)
```

## Testing

```bash
npm test
```

Covers all three required layers:
- **Data access** — question-bank loader against the bundled JSON fixtures, including the BR-07 fallback-on-corrupt-data path (`questionRepository.test.ts`, `questionRepository.fallback.test.ts`), plus player/level seed loading.
- **Business logic** — the Adaptive Learning Engine's Elo difficulty, hint-frequency, and Pomodoro session/break formulas, exercised with mocked signal inputs (`elo.test.ts`, `hintFrequency.test.ts`, `pomodoroEngine.test.ts`, `battleEngine.test.ts`).
- **UI/screen smoke test** — a full Onboarding → Map → Phase 2 → Battle Loop → Pomodoro walkthrough (`navigationSmoke.test.tsx`).

## Known limitations

- **No persistence.** All state (profile, Elo rating, Pomodoro history) is in-memory only and resets on app restart, by design — restarting and re-selecting a player is the documented crash-recovery path.
- **Only Level 3 is playable.** Levels 1–2 are pre-completed map stubs; levels 4–15 are locked/coming-soon placeholders. This is the PRD's locked scope decision for the hackathon build, not a bug.
- **No Grades 4–6 content.** Scope is locked to Grade 1, Quarter 1, Numbers and Number Sense (visualizing 0–100, one-more/one-less, regrouping).
- **No teacher/parent view.** Student-only by design; out of scope for this MVP.
- **Chatbot is hardcoded.** The Phase 2 chat bubble is a pure lookup table, not a live model call.
- **Placeholder folklore art.** The bundled character art (`Buboy`/`Sigbin`) predates the final Tikbalang/Aswang/Kapre naming — swap in final art via `app/common/theme/characterArt.ts` once ready.
- **Number-sense and one-more-one-less question banks ship bundled but aren't yet wired to a second playable level** — only Level 3's regrouping battle is playable in this build.
