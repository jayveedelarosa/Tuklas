# Tuklas
### Uncover the Joy of Learning

> "Ang pag-aaral ay pagsusunog ng kilay." — We disagree.

A gamified, adaptive, fully offline mobile app that packages official DepEd lessons into a Philippine folklore monster-battler, paired with an adaptive Pomodoro focus timer. Built in 24 hours for ACM TechSprint × Asteria 2026

## Team — Haribirds

- Jersylle Hannah Nismal
- Enzo Lorzano
- Roel Aquino
- Jayvee Dela Rosa

---

## The Problem

Filipino kids practice math the same way whether they're struggling or coasting. Nothing notices. Nothing adapts.

Filipino resilience is real — but it shouldn't be the reason non-adaptive systems get a pass.

---

## What Tuklas Does

Tuklas wraps DepEd-aligned math inside a Philippine folklore adventure. Kids battle monsters by answering questions. The app watches how they play — and adjusts in real time.

**Four signals in. Three adaptations out. One message the child actually sees.**

| Signals In | Outputs |
|---|---|
| Quiz accuracy | Question difficulty |
| Response time | Hint frequency |
| Pomodoro completion | Session length |
| Streak history | |

The on-screen message — *"Tuklas noticed you're struggling — here's an easier question"* — is the feature. Not the adjusting. The showing.

### Core features (MVP pitch)

- **Folklore map & battles** — Defeat monsters via DepEd Grade 3 math questions across a 15-node map
- **Adaptive Learning Engine** — Elo-based difficulty, derived hint frequency, bounded Pomodoro adjustment
- **Pomodoro focus mode** — 25/5 baseline, adaptively adjusted per session history
- **Behavioral adherence tracking** — Daily streak counter + calendar heatmap
- **Bilingual dialogue** — English and Tagalog throughout
- **Demo onboarding** — 3 pre-seeded player profiles so judges see mid-progress states immediately
- **Fully offline** — No internet required; no backend; no auth

---

## What's built (vertical slice)

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

---

## The Adaptive Engine

### Difficulty — Elo meets flow theory

Adapted from chess Elo ratings for educational use (Pelánek, 2016):

```
P(correct) = 1 / (1 + e^(-(θ_student - β_question)))

θ_student += K × (actual - P(correct))
β_question += K × (P(correct) - actual)
```

Next question difficulty is chosen by matching β_question closest to current θ_student — keeping the student in Csikszentmihalyi's flow zone (challenge = skill). In code this is `elo.ts`'s `ELO_K_FACTOR = 0.45`, with `pickNextDifficultyTier` snapping to the closest of three fixed tiers (-1, 0, 1); slow-but-correct answers (over `SLOW_RESPONSE_THRESHOLD_MS = 6000`) get a halved K.

### Hint frequency — derived from the same gap

```
hintFrequency = clamp((β - θ) × sensitivity, 0, 1)
```

No separate tuning needed. Larger gap → more hints. Student ahead of question → no hints, difficulty bumps instead.

### Session length — adaptive Pomodoro

Bounded adjustment around the Cirillo (2018) baseline:

```
sessionLength = clamp(25 + adjustmentStep × (completionRate - 0.5) × 2, 15, 35)
breakLength   = clamp(5  + adjustmentStep × (1 - completionRate) × 2,  5, 10)
```

Rolling average over the last 3 sessions (`pomodoroEngine.ts`). Cold start defaults to 25/5 until history exists.

> Rule-based, not ML. Research-grounded formulas. Honest v1 framing. Fuller adaptive roadmap ahead.

---

## Tech stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React Native + Expo (TypeScript), Expo Go-compatible | Fastest setup-to-running-app for a 4-person 24hr team |
| Navigation | React Navigation (native-stack) | |
| State | Zustand, in-memory only | No backend — client state is the database |
| Data | Bundled JSON (`data/*.json`) | Zero network dependency |
| Backend | None — chatbot is a hardcoded lookup table | Roadmap: swap in a live Gemini API call for the Phase 2 chatbot |
| Auth | None | Student-only, session-only |
| Testing | Jest + jest-expo + React Native Testing Library | |
| Deployment | Expo Go + EAS Build | Expo Go sufficient for judging |

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

---

## References

The Adaptive Engine is grounded in published educational measurement and productivity research:

- Pelánek, R. (2016). *Applications of the Elo rating system in adaptive educational systems.* Computers & Education.
- Selent, D., Patikorn, T., & Heffernan, N. (2019). *A Multivariate Elo-based Learner Model for Adaptive Educational Systems.* arXiv:1910.12581
- Csikszentmihalyi, M. (1990). *Flow: The Psychology of Optimal Experience.* Harper & Row.
- Csikszentmihalyi, M., & Schneider, B. (2000). *Becoming Adult.* Basic Books.
- Cirillo, F. (2018). *The Pomodoro Technique.* Currency / Crown.
- PMC12292963 (2024/2025). *Investigating the Effectiveness of Self-Regulated, Pomodoro, and Flowtime Break-Taking Techniques Among Students.*
- van der Linden, W. J. (2006/2009). Lognormal response-time IRT models. arXiv:1005.0714 *(context only — not directly implemented in MVP)*

---

*"Learning shouldn't burn. Tuklas fixes that."*
