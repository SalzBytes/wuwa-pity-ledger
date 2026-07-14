import { computed, reactive, watch } from 'vue'
import type { Banner, LedgerState, Pull } from '~/utils/types'
import { BANNER_PRESETS, DEFAULT_PULLS, uid } from '~/utils/presets'

const STORAGE_KEY = 'pity-ledger-wuwa-state'
const FOUR_HARD = 10 // guaranteed 4★ on the 10th pull since the last one

// Legacy state had `data` = 5★-only + a separate `star4[]`. Tag every 5★ record
// and fold the 4★ list into one ordered stream (5★ first, then 4★ — original
// interleave is unrecoverable). 3★ were never stored, so they don't backfill.
// ponytail: cross-rarity order for pre-migration pulls is approximate; new pulls
// are exact. Drop this once no legacy blobs remain in the wild.
function migrateBanner(b: Banner) {
  if (b.data?.some(d => d.rarity)) return // already unified
  const five: Pull[] = (b.data || []).map(d => ({ ...d, rarity: 5 as const }))
  const four: Pull[] = (b.star4 || []).map(v => ({ value: 0, won: null, rarity: 4 as const, p4: v }))
  b.data = [...five, ...four]
  delete b.star4
}


function defaultState(): LedgerState {
  const p = BANNER_PRESETS.character
  return {
    activeBannerId: 'default',
    weightRecent: false,
    banners: [
      {
        id: 'default',
        name: 'Character Event Convene',
        type: 'character',
        maxPity: p.maxPity,
        yellowFrom: p.yellowFrom,
        redFrom: p.redFrom,
        has5050: p.has5050,
        pullCost: p.pullCost,
        currentPity: 45,
        guaranteed: false,
        data: DEFAULT_PULLS.map(d => ({ ...d }))
      }
    ]
  }
}

// module-level singleton — shared across all components
const state = reactive<LedgerState>(defaultState())
let loaded = false

function loadState() {
  if (loaded || !import.meta.client) return
  loaded = true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && Array.isArray(parsed.banners) && parsed.banners.length) {
        parsed.banners.forEach(migrateBanner)
        Object.assign(state, parsed)
      }

    }
  } catch {
    /* no valid saved state */
  }
  // persist on any change (debounced)
  let t: ReturnType<typeof setTimeout>
  watch(
    state,
    () => {
      clearTimeout(t)
      t = setTimeout(() => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
        } catch {
          /* quota / unavailable */
        }
      }, 250)
    },
    { deep: true }
  )
}

export function useLedger() {
  loadState()

  const activeBanner = computed<Banner>(
    () => state.banners.find(b => b.id === state.activeBannerId) || state.banners[0]
  )

  const isGuaranteed = (b: Banner) => !!(b.has5050 && b.guaranteed)

  function selectBanner(id: string) {
    state.activeBannerId = id
  }

  function createBanner(name: string, type: string) {
    const preset = BANNER_PRESETS[type] || BANNER_PRESETS.custom
    const nb: Banner = {
      id: uid(),
      name,
      type,
      maxPity: preset.maxPity,
      yellowFrom: preset.yellowFrom,
      redFrom: preset.redFrom,
      has5050: preset.has5050,
      pullCost: preset.pullCost,
      currentPity: 0,
      guaranteed: false,
      data: []
    }
    state.banners.push(nb)
    state.activeBannerId = nb.id
  }

  function deleteBanner(id: string): boolean {
    if (state.banners.length <= 1) return false
    state.banners = state.banners.filter(b => b.id !== id)
    if (!state.banners.find(b => b.id === state.activeBannerId)) {
      state.activeBannerId = state.banners[0].id
    }
    return true
  }

  function saveSettings(patch: Partial<Banner>) {
    const b = activeBanner.value
    Object.assign(b, patch)
    b.currentPity = Math.min(b.currentPity || 0, b.maxPity)
  }

  function adjustPity(delta: number) {
    const b = activeBanner.value
    b.currentPity = Math.max(0, Math.min(b.maxPity, (b.currentPity || 0) + delta))
  }

  function syncPity(val: number) {
    activeBanner.value.currentPity = val
  }

  function toggleGuaranteed(): boolean | null {
    const b = activeBanner.value
    if (!b.has5050) return null
    b.guaranteed = !b.guaranteed
    return b.guaranteed
  }

  // ---- unified pull stream (3★ / 4★ / 5★ share ONE ordered log) ----
  // Live pities are derived from the log so history + prediction stay in sync.
  // `pity4` on the banner is the *current* 4★ counter (pulls since last 4★).
  const clampP4 = (v: number) => Math.max(0, Math.min(FOUR_HARD - 1, Math.floor(v) || 0))

  // pity positions this convene would sit at (before any reset)
  const nextP5 = (b: Banner) => Math.min(b.maxPity, (b.currentPity || 0) + 1)
  const nextP4 = (b: Banner) => Math.min(FOUR_HARD, (b.pity4 || 0) + 1)

  // 5★ pity values, newest-first — what stats / prediction / charts consume.
  const fiveData = computed<Pull[]>(() => activeBanner.value.data.filter(d => (d.rarity ?? 5) === 5))
  // 4★ landed-pity list, newest-first — what the 4★ history reads.
  const star4 = computed<number[]>(() =>
    activeBanner.value.data.filter(d => d.rarity === 4).map(d => d.p4 ?? 0)
  )

  // One convene = a 3★ by default. Advances both pities; the 10th convene since
  // the last 4★ auto-upgrades this record to a guaranteed rate-up 4★.
  function pull() {
    const b = activeBanner.value
    const p5 = nextP5(b)
    const p4 = nextP4(b)
    if (p4 >= FOUR_HARD) {
      b.data.unshift({ value: p5, won: null, rarity: 4, p4: FOUR_HARD })
      b.pity4 = 0
    } else {
      b.data.unshift({ value: p5, won: null, rarity: 3, p4 })
      b.pity4 = p4
    }
    b.currentPity = p5
  }

  // undo the most recent convene (whatever rarity), rolling pities back
  function undoPull() {
    const b = activeBanner.value
    const last = b.data[0]
    if (!last) return
    b.data.shift()
    b.currentPity = Math.max(0, (b.currentPity || 0) - 1)
    // recompute 4★ counter from the stream head
    b.pity4 = pity4Since(b)
    if (last.rarity === 5 && b.has5050) recomputeGuarantee(b)
  }

  // pulls since the last 4★ or 5★ at the head of the log (0..9)
  function pity4Since(b: Banner): number {
    let n = 0
    for (const d of b.data) {
      const r = d.rarity ?? 5
      if (r === 4 || r === 5) break
      n++
    }
    return Math.min(FOUR_HARD - 1, n)
  }
  function recomputeGuarantee(b: Banner) {
    const lastFive = b.data.find(d => (d.rarity ?? 5) === 5)
    b.guaranteed = lastFive ? lastFive.won === false : false
  }

  function setPity4(v: number) { activeBanner.value.pity4 = clampP4(v) }

  // Got a 4★. The landed pity is the *current* pity4 counter the user built up
  // (via "+" taps or the manual ±). If the last "+" left a 3★ placeholder for
  // this same pull, convert it in place; otherwise this pull IS the 4★.
  // Either way it lands at pity4 — no extra +1.
  function log4Star() {
    const b = activeBanner.value
    const landed = Math.max(1, b.pity4 || 0)
    const head = b.data[0]
    if (head && head.rarity === 3 && (head.p4 ?? 0) === (b.pity4 || 0)) {
      // convert the placeholder 3★ from the last "+" into the 4★
      head.rarity = 4
      head.p4 = landed
    } else {
      const p5 = nextP5(b)
      b.data.unshift({ value: p5, won: null, rarity: 4, p4: landed })
      b.currentPity = p5
    }
    b.pity4 = 0
  }


  // delete a 4★ by its position within the 4★-only view
  function removeStar4(idx: number) {
    const b = activeBanner.value
    let seen = -1
    const at = b.data.findIndex(d => d.rarity === 4 && ++seen === idx)
    if (at >= 0) { b.data.splice(at, 1); b.pity4 = pity4Since(b) }
  }

  // Got the 5★: append a 5★ record, reset both pities, set 50/50 guarantee.
  function addPull(value: number, won: boolean | null) {
    const b = activeBanner.value
    b.data.unshift({ value, won: b.has5050 ? won : null, rarity: 5, p4: nextP4(b) })
    b.currentPity = 0
    b.pity4 = 0
    if (b.has5050) b.guaranteed = won === false
  }

  // edit operates on the 5★-only index (HistoryGrid/EditPull address 5★ that way)
  function editPull(idx: number, value: number, won: boolean | null) {
    const b = activeBanner.value
    let seen = -1
    const at = b.data.findIndex(d => (d.rarity ?? 5) === 5 && ++seen === idx)
    if (at < 0) return
    b.data[at].value = value
    if (b.has5050) {
      b.data[at].won = won
      recomputeGuarantee(b)
    }
  }

  // delete a 5★ by its position within the 5★-only view

  function deletePull(idx: number) {

    const b = activeBanner.value
    let seen = -1
    const at = b.data.findIndex(d => (d.rarity ?? 5) === 5 && ++seen === idx)
    if (at >= 0) { b.data.splice(at, 1); if (b.has5050) recomputeGuarantee(b) }
  }


  function setWeightRecent(v: boolean) {
    state.weightRecent = v
  }

  function replaceState(next: LedgerState) {
    Object.assign(state, next)
    if (!state.banners.find(b => b.id === state.activeBannerId)) {
      state.activeBannerId = state.banners[0].id
    }
  }

  return {
    state,
    activeBanner,
    isGuaranteed,
    selectBanner,
    createBanner,
    deleteBanner,
    saveSettings,
    adjustPity,
    syncPity,
    toggleGuaranteed,
    FOUR_HARD,
    fiveData,
    star4,
    pull,
    undoPull,
    setPity4,
    log4Star,
    removeStar4,
    addPull,

    editPull,

    deletePull,


    setWeightRecent,
    replaceState
  }
}
