import { computed, reactive, watch } from 'vue'
import type { Banner, LedgerState } from '~/utils/types'
import { BANNER_PRESETS, DEFAULT_PULLS, uid } from '~/utils/presets'

const STORAGE_KEY = 'pity-ledger-wuwa-state'

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

  // add a completed pull; won ignored when banner has no 50/50
  function addPull(value: number, won: boolean | null) {
    const b = activeBanner.value
    b.data.unshift({ value, won: b.has5050 ? won : null })
    b.currentPity = 0
    if (b.has5050) b.guaranteed = won === false
  }

  function editPull(idx: number, value: number, won: boolean | null) {
    const b = activeBanner.value
    if (!b.data[idx]) return
    b.data[idx].value = value
    if (b.has5050) {
      b.data[idx].won = won
      if (idx === 0) b.guaranteed = won === false
    }
  }

  function deletePull(idx: number) {
    activeBanner.value.data.splice(idx, 1)
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
    addPull,
    editPull,
    deletePull,
    setWeightRecent,
    replaceState
  }
}
