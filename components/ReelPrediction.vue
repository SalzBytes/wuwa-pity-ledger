<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { Banner } from '~/utils/types'
import { bandOf, chartColor } from '~/utils/bands'
import { samplePrediction } from '~/composables/usePrediction'
import { useToast } from '~/composables/useToast'

const props = defineProps<{ banner: Banner; weightRecent: boolean }>()
const emit = defineEmits<{ 'update:weightRecent': [v: boolean] }>()
const { showToast } = useToast()

// re-run on any 5★ add/edit/delete only (3★/4★ share the stream but don't feed
// the 5★ model — excluding them keeps the 10k-draw sim off the tap path)
const dataSig = computed(() =>
  props.banner.data.filter(d => (d.rarity ?? 5) === 5).map(d => d.value).join(',')
)

const pred = computed(() => {
  void dataSig.value
  return samplePrediction(props.banner, props.weightRecent)
})


const digits = ref('--')
const digitColor = ref('#f2c869')
const spinning = ref(false)
const simulated = ref<number | null>(null) // last simulated draw, sticks after spin

// live prediction display: sim result if present, else live prediction
const displayDigits = computed(() => {
  if (spinning.value) return digits.value
  if (simulated.value !== null) return String(simulated.value).padStart(2, '0')
  return pred.value ? String(pred.value.value).padStart(2, '0') : '--'
})
const displayColor = computed(() => {
  if (spinning.value) return digitColor.value
  const v = simulated.value ?? pred.value?.value
  return v != null ? chartColor(bandOf(v, props.banner)) : '#f2c869'
})

const confLine = computed(() =>
  pred.value ? `${pred.value.value} · ${pred.value.confidence.toFixed(1)}% likely` : '—'
)
const bandLine = computed(() => {
  if (!pred.value) return 'Log a pull to unlock predictions'
  return props.weightRecent ? 'recency-weighted bootstrap · 10,000 draws' : 'bootstrap · 10,000 draws'
})

// reset sim when switching banners / toggling weighting so live prediction shows again
watch(() => [props.banner.id, props.weightRecent], () => { simulated.value = null })

function simulate() {

  if (!props.banner.data.length || !pred.value) {
    showToast('Add some pulls first.', 'warn')
    return
  }
  spinning.value = true
  let ticks = 0
  const timer = setInterval(() => {
    digits.value = String(Math.floor(Math.random() * (props.banner.maxPity + 1))).padStart(2, '0')
    ticks++
    if (ticks > 10) {
      clearInterval(timer)
      const result = pred.value!.sampleOne()
      digits.value = String(result).padStart(2, '0')
      digitColor.value = chartColor(bandOf(result, props.banner))
      simulated.value = result
      spinning.value = false

      showToast(`Simulated pull: ${result}`, 'good')
    }
  }, 55)
}
</script>

<template>
  <div class="bg-panel border border-hairline rounded-2xl p-5 flex flex-wrap items-center gap-5 justify-between mb-6">
    <div>
      <div class="text-xs uppercase tracking-widest text-faint font-600 mb-2">Predicted next pity</div>
      <div class="flex items-center gap-3">
        <div class="bezel rounded-xl w-24 h-16 flex items-center justify-center shadow-reel" :class="{ 'reel-spin': spinning }">
          <span class="led text-4xl" :style="{ color: displayColor }">{{ displayDigits }}</span>
        </div>
        <div>
          <div class="text-ink font-600">{{ confLine }}</div>
          <div class="text-xs text-faint">{{ bandLine }}</div>
        </div>
      </div>
    </div>
    <div class="flex flex-col items-end gap-2">
      <button class="px-5 py-2.5 rounded-full bg-brass text-[#241a04] font-700 hover:brightness-110 active:scale-95 transition shadow-[0_6px_18px_rgba(217,172,79,0.25)]" @click="simulate">
        🎲 Simulate pull
      </button>
      <label class="flex items-center gap-2 text-xs text-faint cursor-pointer select-none">
        <input
          type="checkbox"
          class="accent-brass w-3.5 h-3.5"
          :checked="weightRecent"
          @change="emit('update:weightRecent', ($event.target as HTMLInputElement).checked)"
        />
        Weight recent pulls more
      </label>
    </div>
  </div>
</template>
