# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Tuklas — a fully-offline React Native (Expo) app that wraps DepEd Grade 1 math practice (Quarter 1, Numbers and Number Sense) inside a Philippine-folklore monster-battle game, paired with an adaptive Pomodoro focus timer. Hackathon vertical slice: only Level 3 ("Bukid ng Bayabas" vs. Sigbin) is playable end to end; levels 1-2 are pre-completed stubs and 4-15 are locked placeholders — this is a locked scope decision, not missing work. The level-3 enemy displays as "Sigbin" rather than its original lore name "Kapre" because Sigbin is the only monster with finished, distinct battle art — see **Placeholder art** below. Kapre/Tikbalang/Aswang remain locked future roster entries with no art of their own.

No backend, no auth, no persistence by design: all runtime state lives in a Zustand store and resets on app restart. Restarting and re-picking a player is the documented crash-recovery path — do not add AsyncStorage/SQLite persistence to "fix" this unless explicitly asked.

The app is locked to landscape orientation (`app.json` → `"orientation": "landscape"`). Design and review every screen assuming a wide/short viewport, not portrait.

**Safe areas**: every screen must import `SafeAreaView` from `react-native-safe-area-context`, never from core `react-native`. The core RN `SafeAreaView` is a no-op on Android — using it lets content render underneath the status bar and the gesture nav bar, which is exactly the bug this codebase shipped with once already. `App.tsx`'s `SafeAreaProvider` is already wired up; screens just need the right import.

## Commands

```bash
npm install        # install deps
npm start           # expo start — scan QR with Expo Go
npm run android     # expo start --android
npm run ios         # expo start --ios (macOS only)
npm run web          # expo start --web (requires `npx expo install react-dom react-native-web` first — not installed by default)
npm test            # jest (preset jest-expo)
```

Run a single test file: `npx jest app/tests/elo.test.ts`
Run by name: `npx jest -t "name fragment"`

Tests live in `app/tests/` (not colocated with source) and cover three layers: data-access repositories, pure business-logic services (Elo, hint frequency, Pomodoro formulas), and one full-flow navigation smoke test (`navigationSmoke.test.tsx`: Onboarding → Map → InteractiveLearning → Battle → Pomodoro).

## Architecture

**Feature-sliced layout under `app/`**: each feature in `app/features/<name>/` follows `models/` (types), `repository/` (data loading), `service/` (pure logic, no React), `screens/` (UI). Cross-feature shared code is `app/common/` (components, theme, utils) and `app/infrastructure/storage/` (the Zustand session store). Keep new code inside this shape — pure logic in `service/`, never inline in screens, so it stays unit-testable without React.

**Navigation**: a single native-stack in `app/navigation/RootNavigator.tsx`, route params typed in `app/navigation/types.ts` (`RootStackParamList`). Flow: Onboarding → Map → InteractiveLearning → Battle → (SessionSummary | PomodoroBreak) → Roster.

**Session state** (`app/infrastructure/storage/sessionStore.ts`): one Zustand store, hydrated from a `PlayerProfile` seed at onboarding (`hydrateFromPlayer`), mutated via actions (`completeLevel`, `setBattleState`, `recordPomodoroSession`, `applyPomodoroAdjustment`), and fully reset via `resetSession`. There is no other source of cross-screen truth.

**Bundled-data + safety-net repositories**: `questionRepository.ts`, `playerRepository.ts`, and `levelRepository.ts` all follow the same BR-07 pattern — load a bundled JSON fixture (`data/*.json`, `app/features/topics/data/*.json`), runtime-validate its shape with an `isValid*` guard, and silently fall back to a hardcoded `SAFETY_*` constant in the same file on any parse/shape failure. **Never throw out of these loaders** — the contract is the student never sees a crash or raw error mid-demo. When adding a new bundled dataset, replicate this validate-or-fallback shape rather than trusting the JSON directly.

**Adaptive Learning Engine** (`app/features/battle/service/`): the core gameplay loop is a pure reducer, not component state.
- `battleEngine.ts` — `submitAnswer(state, input)` is the single state transition: picks correctness, calls into `elo.ts` to update student/question ratings, picks the next question/tier, and collects any "Tuklas noticed..." notices to surface.
- `elo.ts` — Elo-style theta/beta update (`ELO_K_FACTOR = 0.45`); slow-but-correct answers (`SLOW_RESPONSE_THRESHOLD_MS = 6000`) get a halved K. `pickNextDifficultyTier` snaps to the closest of three fixed tiers (-1, 0, 1).
- `hintFrequency.ts` — derives hint-offer probability from theta/beta.
- `noticeRules.ts` — builds the bilingual (`en`/`tl`) `TuklasNotice` objects. **Every adaptive adjustment (difficulty up/down, hint offered, Pomodoro length change) must produce a visible on-screen notice** — this is a demo-critical product requirement, not optional UX polish. If you change engine logic that alters difficulty/hints/session length, make sure a corresponding notice still fires.
- `useBattleEngine.ts` is the only bridge from this pure engine into React — screens should consume it, not call `battleEngine.ts` functions directly.

The Pomodoro engine (`app/features/pomodoro/service/pomodoroEngine.ts`) mirrors the same pure-function-plus-notice pattern: `recomputePomodoroAdjustment` bounds session/break length around the Cirillo 25/5 baseline using a rolling completion-rate window, and emits a notice whenever a length actually changes.

**Bilingual UI**: every English UI string ships with a Tagalog line beneath it (see `BilingualText.tsx` and the `en`/`tl` fields throughout). Keep this pairing when adding or editing user-facing copy.

**OnboardingScreen header scrim**: the logo+title header in `OnboardingScreen.tsx` sits on top of `onboardingBackground`, whose top band is a dark sunset red/orange — too dark for the default `colors.textDark` text to stay readable on its own. The header `View` carries a translucent cream `backgroundColor` (`rgba(255, 246, 229, 0.6)`) and `alignSelf: 'flex-start'` so it acts as a contrast scrim sized to just the logo+text, not the full row width. Don't strip that styling when touching this screen, and re-check it if `onboardingBackground` is ever swapped for different art. The three player cards don't need this treatment since they're already opaque white surfaces.

**Phase 2 / InteractiveLearningScreen** (`app/features/learning/screens/InteractiveLearningScreen.tsx`): five beats teaching tens-and-ones before the graded battle. Each beat advances only on an explicit "Next" tap (`testID: beat-next-button`) — there is **no auto-advance timer**; an earlier timer-driven version skipped past beats too fast for students to read. Each beat also shows a short bilingual caption pulled from `getResponseForBeat()` (`app/features/learning/repository/chatbotRepository.ts`, backed by `data/chatbot_responses.json`) so the on-screen circles are explained, not just animated past. The whole beat column is wrapped in a `ScrollView` because beat content height varies a lot (the tens/ones equation beat is much taller than the plain pile beat) — don't go back to a fixed-height `flex: 1` "stage" container for this; it silently overflows underneath the caption/button instead of erroring, which is exactly the bug that shipped before.

**Placeholder art**: `app/common/theme/characterArt.ts` is the single place that maps logical art roles to bundled image files — swap paths here, not call sites, when final art lands. `characterArt.sigbin.calm` is the only monster with real, finished art (`assets/characters/Sigbin.png`, used by `RosterScreen`). `tikbalang`/`aswang`/`kapre` have no art of their own yet and fall back to the same Sigbin sprite. `tuklasMascot.{calm,idle1,idle2}` all point at the single companion sprite (`Tuklas(companion of the main character).png`); `appLogo` is the branding mark (`assets/app logo/App Logo.png`), used as the app icon and on the Onboarding header. `onboardingBackground` (`assets/onboarding/Background on boarding.png`) is a generated pixel-art Philippine-beach-at-golden-hour scene used as the full-screen `ImageBackground` on `OnboardingScreen`. There is no `characterArt.*.battle` or `playerArt` anymore — see **Battle screen layout** below for why. Asset folders: `assets/characters/`, `assets/levels/` (battle backgrounds), `assets/map/` (per-city map backgrounds, only one of which — Manila — is currently wired up since just one level is playable), `assets/app logo/`, `assets/onboarding/`.

**Battle screen layout**: `BattleScreen.tsx` renders a scene over `assets/levels/Level 3.png`, which is a fully painted scene with Buboy and Sigbin already drawn into the artwork at fixed positions (Buboy on the left, Sigbin on the right) — it is not an empty backdrop. Because of that, `MonsterDisplay.tsx` and `PlayerBattleDisplay.tsx` render **status-box UI only, no character `Image`** — `assets/characters/SigbinBattle.png`/`BuboyBattle.png` (crops of `assets/levels/Characters in battle scene.png`) used to be drawn as separate floating sprites on top of this same background, which doubled up every character (the background's painted figure plus the sprite overlay) into a visual mess. Don't reintroduce a sprite `Image` in either component — the background already draws the character. The two status boxes are anchored opposite their own character's position in the painted scene: Sigbin's box is bottom-right (he sits on the right of the scene), Buboy's box is top-left (he sits on the left of the scene) — this is the swap of an earlier top-left/bottom-right pairing, done per explicit user feedback, so don't swap them back without checking first. Both boxes show an `hp/maxHp` number under the bar (Sigbin's `hp`/`maxHp` are derived in `BattleScreen.tsx` from `questions.length` and `correctlyAnsweredIds.length` — the enemy's "lives" are the question set, same idea as `playerHp`/`maxPlayerHp` for Buboy). Don't move either box to "hug" its own character or stack box+sprite together again without checking first. The bottom splits into a dark dialogue box (prompt/feedback/victory/defeat text, left) and a light menu box (right). The answering-state menu box renders 2 explicit rows of `ChoiceButton compact` inside a `flex: 1` column ending in a fixed-height Submit button (`choiceGrid`/`choiceRow`/`choiceCell` all `flex: 1`) — this guarantees the grid + Submit always fit inside the box without pushing Submit off-screen; an earlier `flexWrap` grid with a broken padding override let cells grow tall enough to push Submit past the bottom of the screen. `QuestionCard` and `ChoiceButton` take a compact/`variant="battle"`/`compact` styling path used only here; their default styling is otherwise unused (no other screen renders them).

Player HP is real, not cosmetic: `BattleEngineState` carries `playerHp`/`maxPlayerHp`/`isDefeated` (one life per question in the set, mirroring how the enemy's HP bar drains one share per correct answer). A wrong answer costs one HP; hitting 0 sets `isDefeated` and swaps the dialogue/menu boxes to a defeat block (`testID: defeat-block`) with a "Try again" button (`testID: retry-button`) that calls `engine.resetBattle()` to restart the same battle from scratch in place — it does not navigate away or end the session, and difficulty/hint notices still fire normally even on the answer that triggers defeat (don't suppress them — an earlier attempt at that broke a hint-threshold test).

Keep `testID`s (`question-card`, `choice-0..3`, `submit-answer`, `victory-block`, `defeat-block`, `retry-button`, `continue-button`, `acknowledge-victory`) stable across any future layout change — `navigationSmoke.test.tsx` drives the battle loop purely by `testID`, not by visual structure.

## Testing conventions

Engine/service tests pass mocked signal inputs directly (no React, no timers) — see `elo.test.ts`, `hintFrequency.test.ts`, `pomodoroEngine.test.ts`, `battleEngine.test.ts` for the pattern; `battleEngine.test.ts` includes the player-HP/defeat cases (life count starts at the question-set size, a wrong answer costs one HP, hitting 0 sets `isDefeated` and stops `setCleared` from firing). Repository tests exercise both the happy path against real bundled JSON and the BR-07 fallback path against deliberately malformed input (`questionRepository.fallback.test.ts`). `jest.setup.ts` mocks `react-native-safe-area-context`. `navigationSmoke.test.tsx` presses `beat-next-button` through all four advanceable Phase 2 beats before it expects `lets-go-button` — update that loop count if the beat count in `InteractiveLearningScreen.tsx` ever changes.
