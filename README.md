# Pity Ledger — Wuthering Waves Convene Tracker

Client-only Nuxt 3 app to track your Wuthering Waves convene (gacha) pity, predict
your next 5★ from your own history, and see stats/luck for each banner. All data
lives in your browser's `localStorage` — nothing is sent anywhere.

## Features

- **Live convene tracker** — tap `+` per pull, tap _Got the 5-star!_ to log the exact
  pity and reset. Sync the counter manually anytime. Shows Astrite needed to guarantee.
- **50/50 state** — toggle guaranteed/on-50-50 for character banners.
- **Prediction reel** — empirical bootstrap over your own pull history (10,000 draws),
  optional recency weighting. Spin to simulate a pull.
- **Stats & insights** — mean/median/mode/std-dev, hard-pity hits, longest lucky run,
  average gap between hard pities, 50/50 win rate.
- **Luck index** — your average pity vs a uniform baseline for the banner's cap.
- **Charts** — pity distribution histogram + pity-over-time line (Chart.js).
- **Multiple banners** — presets for Character/Weapon/Standard/Novice + custom.
- **Import / export** — round-trips full state (including history) as JSON.

## Tech stack

- **Nuxt 3** (SPA mode, `ssr: false`) + **Vue 3** `<script setup>`
- **Tailwind CSS** (`@nuxtjs/tailwindcss`) with a custom brass/void theme
- **Chart.js** + **vue-chartjs** (histogram + timeline, client-only component)
- **@nuxtjs/google-fonts** — Chakra Petch / Inter / JetBrains Mono
- State: a single reactive singleton composable (`useLedger`) persisted to `localStorage`

## Run

```bash
bun install
bun run dev        # http://localhost:3000
bun run build      # production build
bun run generate   # static site
```

## Project layout

```
app.vue                 # assembles the page, wires ledger + modals + import/export
composables/
  useLedger.ts          # reactive state singleton + localStorage persistence
  usePrediction.ts      # bootstrap sampler (optionally recency-weighted)
  useStats.ts           # mean/median/mode/insights/luck (pure functions)
  useImportExport.ts    # JSON download / file parse
  useToast.ts           # transient toasts
components/             # UI: tracker, reel, stats, charts, history, modals
utils/
  types.ts              # Banner / Pull / LedgerState
  presets.ts            # banner presets + seed data
  bands.ts              # green/yellow/red pity band classification
```

Not affiliated with Kuro Games. Pity mechanics are approximations for personal tracking.
