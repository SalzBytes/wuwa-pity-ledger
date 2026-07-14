<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLedger } from '~/composables/useLedger'
import { useImportExport } from '~/composables/useImportExport'
import { useToast } from '~/composables/useToast'
import type { Banner, LedgerState } from '~/utils/types'

const {
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
} = useLedger()
const { exportData, importData } = useImportExport()
const { showToast } = useToast()

// modal state
const showNew = ref(false)
const showSettings = ref(false)
const editIndex = ref<number | null>(null)
const pendingFiveStar = ref<number | null>(null) // pity value awaiting 50/50 outcome
const fileInput = ref<HTMLInputElement | null>(null)

const guaranteed = computed(() => isGuaranteed(activeBanner.value))
const canDelete = computed(() => state.banners.length > 1)

function onLogFiveStar() {
  const b = activeBanner.value
  const val = Math.max(1, Math.min(b.maxPity, b.currentPity || 1))
  if (b.has5050 && !isGuaranteed(b)) {
    // ask which side of the 50/50 landed
    pendingFiveStar.value = val
    return
  }
  // guaranteed → featured win; no 50/50 → null
  const won = b.has5050 ? true : null
  addPull(val, won)
  showToast(
    b.has5050 ? 'Guarantee used — featured Resonator secured!' : `Logged a 5★ at ${val} pity.`,
    'good'
  )
}

function onResolveFiveStar(won: boolean) {
  if (pendingFiveStar.value === null) return
  const val = pendingFiveStar.value
  addPull(val, won)
  pendingFiveStar.value = null
  showToast(`Logged a 5★ at ${val} pity — ${won ? 'featured!' : 'lost the 50/50.'}`, won ? 'good' : 'info')
}


function onManualAdd(value: number, won: boolean | null) {
  addPull(value, won)
  showToast(`Added ${value} to history.`, 'good')
}

function onToggleGuarantee() {
  const g = toggleGuaranteed()
  if (g === null) return
  showToast(g ? 'Next 5★ set to guaranteed.' : '50/50 re-enabled.', 'info')
}

function onCreate(name: string, type: string) {
  createBanner(name, type)
}

function onDeleteBanner() {
  const name = activeBanner.value.name
  if (deleteBanner(activeBanner.value.id)) showToast(`Deleted "${name}".`, 'info')
}

function onSaveSettings(patch: Partial<Banner>) {
  saveSettings(patch)
}

function onEditSave(idx: number, value: number, won: boolean | null) {
  editPull(idx, value, won)
  showToast('Pull updated.', 'good')
}

function onEditRemove(idx: number) {
  deletePull(idx)
  showToast('Pull removed.', 'info')
}

function doExport() {
  exportData(state)
  showToast('Exported your ledger.', 'good')
}

function triggerImport() {
  fileInput.value?.click()
}

async function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    const next = (await importData(file)) as LedgerState
    replaceState(next)
    showToast('Ledger imported.', 'good')
  } catch {
    showToast('That file is not a valid export.', 'warn')
  } finally {
    input.value = ''
  }
}
</script>

<template>
  <div class="min-h-screen">
    <Toasts />
    <input ref="fileInput" type="file" accept="application/json" class="hidden" @change="onFile" />

    <header class="border-b border-hairline bg-panel/60 backdrop-blur sticky top-0 z-30">
      <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 class="font-display text-xl sm:text-2xl text-ink tracking-wide">
            <span class="text-brass">Pity</span> Ledger
          </h1>
          <p class="text-xs text-faint">Wuthering Waves convene tracker & pity predictor</p>
        </div>
        <div class="flex items-center gap-2">
          <button class="px-3 py-2 rounded-lg bg-panel2 border border-hairline text-faint hover:text-ink hover:border-brassdim text-sm transition" @click="triggerImport">Import</button>
          <button class="px-3 py-2 rounded-lg bg-panel2 border border-hairline text-faint hover:text-ink hover:border-brassdim text-sm transition" @click="doExport">Export</button>
          <button class="px-3 py-2 rounded-lg bg-panel2 border border-hairline text-faint hover:text-ink hover:border-brassdim text-sm transition" @click="showSettings = true">⚙ Settings</button>
        </div>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-4 py-6">
      <BannerTabs
        :banners="state.banners"
        :active-id="state.activeBannerId"
        @select="selectBanner"
        @new-banner="showNew = true"
      />

      <p class="text-xs text-faint mb-4 -mt-1">
        {{ activeBanner.name }} · cap {{ activeBanner.maxPity }} · soft {{ activeBanner.yellowFrom }} · hard {{ activeBanner.redFrom }}<span v-if="activeBanner.has5050"> · 50/50</span>
      </p>

      <LiveTracker
        :banner="activeBanner"
        :guaranteed="guaranteed"
        @adjust="adjustPity"
        @sync="syncPity"
        @log-five-star="onLogFiveStar"
        @toggle-guarantee="onToggleGuarantee"
      />

      <ReelPrediction
        :banner="activeBanner"
        :weight-recent="state.weightRecent"
        @update:weight-recent="setWeightRecent"
      />

      <PredictTable :banner="activeBanner" :weight-recent="state.weightRecent" />


      <StatsGrid :banner="activeBanner" />

      <div class="grid lg:grid-cols-2 gap-4 mb-6">
        <ProbBars :banner="activeBanner" />
        <LuckIndex :banner="activeBanner" />
      </div>

      <InsightsGrid :banner="activeBanner" />

      <Charts :banner="activeBanner" />

      <ManualLog :banner="activeBanner" @add="onManualAdd" />

      <HistoryGrid
        :banner="activeBanner"
        @edit="editIndex = $event"
        @delete="onEditRemove"
      />

      <footer class="text-center text-xs text-faint mt-10 pb-4">
        Everything is stored locally in your browser. Not affiliated with Kuro Games.
      </footer>
    </main>

    <NewBannerModal v-if="showNew" @close="showNew = false" @create="onCreate" />

    <SettingsModal
      v-if="showSettings"
      :banner="activeBanner"
      :can-delete="canDelete"
      @close="showSettings = false"
      @save="onSaveSettings"
      @delete-banner="onDeleteBanner"
    />

    <EditPullModal
      v-if="editIndex !== null"
      :banner="activeBanner"
      :index="editIndex"
      @close="editIndex = null"
      @save="onEditSave"
      @remove="onEditRemove"
    />

    <ResultModal
      v-if="pendingFiveStar !== null"
      :value="pendingFiveStar"
      @close="pendingFiveStar = null"
      @resolve="onResolveFiveStar"
    />
  </div>
</template>
