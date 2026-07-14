# Agent Guide — Pity Ledger

Client-only Wuthering Waves convene (gacha) pity tracker. Logs pity per banner, predicts next 5★ from your own history, shows stats/luck/charts. All data in browser `localStorage` — nothing leaves the machine.

## Tech stack

- **Nuxt 3** (3.13.2), SPA mode (`ssr: false`) + **Vue 3** `<script setup>` + TypeScript
- **Tailwind CSS** via `@nuxtjs/tailwindcss` — custom brass/void dark theme
- **Chart.js** 4 + **vue-chartjs** — histogram + timeline (client-only component)
- **@nuxtjs/google-fonts** — Chakra Petch (display), Inter (body), JetBrains Mono (LED/numbers)
- **bun** package manager
- State: single reactive singleton composable (`useLedger`) persisted to `localStorage`
- No backend, no auth, no network calls

Note: `index.html` is the **original single-file vanilla prototype** (Tailwind CDN, Chart.js CDN, plain JS in one IIFE, `window.storage` API). The Nuxt app under `app.vue` / `components/` / `composables/` is the refactor. Use `index.html` as the behavior reference; don't ship it.

## Theme tokens (Tailwind custom colors)

```
void #080a10   panel #11151f   panel2 #171d2b   panel3 #1e2537   hairline #242c3f
brass #d9ac4f  brassdim #8a6d2f  brassglow #f2c869
lucky #34d399 (green)  soft #f5b942 (yellow)  hard #ff5d6c (red)
ink #e9edf6 (text)  faint #6d7891 (muted)
```

Pity bands: **green** = lucky (`< yellowFrom`), **yellow** = soft pity (`yellowFrom..redFrom-1`), **red** = hard pity (`>= redFrom`). LED reel uses mono font + text-shadow glow. Body has radial-gradient bg.

## App explanation

Per-banner gacha tracker. Core loop:

1. **Live tracker** — tap `+` per pull (including the winning one), tap _Got the 5-star!_ to log that pity value and reset `currentPity` to 0. Sync counter manually anytime. Shows Astrite-to-guarantee (`pullsLeft * pullCost`, 160/pull).
2. **50/50** — character banners have a 50/50; losing → next 5★ guaranteed featured. Toggle guaranteed state; win/loss stored per pull (`won: boolean|null`).
3. **Prediction reel** — empirical bootstrap over the banner's own history, 10,000 draws (`samplePrediction`). Optional recency weighting (geometric decay 0.94, recent pulls count more). "Simulate pull" spins the reel to one bootstrap sample. Not a guarantee.
4. **Stats/insights** — mean/median/mode/std-dev/min-max, hard-pity hits, longest lucky run, avg gap between hard pities, 50/50 win rate.
5. **Luck index** — average pity vs uniform baseline for the banner cap.
6. **Charts** — frequency-by-pity histogram + pity-over-time trend (Chart.js).
7. **Multiple banners** — presets: Character (80 pity, 66 soft, 50/50), Weapon, Standard char/weapon, Novice (50 pity), Custom. Everything editable in Banner settings.
8. **Import/export** — full state round-trips as JSON (`useImportExport`).

## Data model (`utils/types.ts`)

```ts
Pull   { value: number; won: boolean | null }   // won: 50/50 result, null if no 50/50
Banner { id, name, type, maxPity, yellowFrom, redFrom, has5050,
         pullCost, currentPity, guaranteed, data: Pull[] }  // data[0] = most recent
LedgerState { activeBannerId, weightRecent, banners: Banner[] }
```

## Project layout

```
app.vue                 # assembles page, wires ledger + modals + import/export
nuxt.config.ts          # ssr:false, modules, fonts
tailwind.config.js      # custom theme tokens
composables/
  useLedger.ts          # reactive state singleton + localStorage persistence
  usePrediction.ts      # bootstrap sampler (optional recency weight)
  useStats.ts           # pure stat/insight/luck fns
  useImportExport.ts    # JSON download / file parse
  useToast.ts           # transient toasts
components/             # LiveTracker, ReelPrediction, Stats/Insights, Charts.client, HistoryGrid, BannerTabs, modals, Toasts
utils/
  types.ts              # Banner / Pull / LedgerState
  presets.ts            # banner presets + seed data
  bands.ts              # green/yellow/red band classification + chart colors
```

## Commands

```bash
bun install
bun run dev        # http://localhost:3000
bun run build
bun run generate   # static site
```

## Conventions

- `<script setup lang="ts">`, composables are `use*`, singleton state lives in `useLedger`.
- Pure logic (stats, prediction, bands) stays in `composables/`/`utils/` — components render only.
- Client-only bits (Chart.js) → `*.client.vue`.
- Persist on every mutation via the ledger; debounced write to `localStorage`.
- Keep the brass/void theme + band color semantics consistent.

Not affiliated with Kuro Games. Pity mechanics are approximations for personal tracking.
