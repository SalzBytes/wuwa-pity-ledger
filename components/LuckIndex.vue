<script setup lang="ts">
import { computed } from 'vue'
import type { Banner } from '~/utils/types'
import { computeLuck } from '~/composables/useStats'

const props = defineProps<{ banner: Banner }>()
const luck = computed(() => computeLuck(props.banner))

const clampedPos = computed(() => {
  if (!luck.value) return 50
  const clamped = Math.max(-100, Math.min(100, luck.value.pct))
  return ((clamped + 100) / 200) * 100
})
const barColor = computed(() => {
  if (!luck.value) return '#6d7891'
  return luck.value.pct > 8 ? '#34d399' : luck.value.pct < -8 ? '#ff5d6c' : '#f5b942'
})
const label = computed(() =>
  luck.value ? (luck.value.pct > 0 ? '+' : '') + luck.value.pct.toFixed(0) + '%' : '—'
)
const note = computed(() =>
  luck.value
    ? `Your average pity is ${luck.value.avg.toFixed(1)} vs a ${luck.value.baseline.toFixed(0)} baseline for a ${props.banner.maxPity}-pull cap.`
    : "Compares your average pity to a uniform baseline for this banner's cap."
)
</script>

<template>
  <div class="bg-panel border border-hairline rounded-2xl p-5">
    <div class="text-xs uppercase tracking-widest text-faint font-600 mb-3 flex items-center justify-between">
      <span>Luck index</span>
      <span class="text-ink font-700 font-display">{{ label }}</span>
    </div>
    <div class="h-3 rounded-full bg-void border border-hairline overflow-hidden relative">
      <div class="h-full rounded-full transition-all duration-500" :style="{ width: clampedPos + '%', background: barColor }" />
      <div class="absolute top-0 left-1/2 -translate-x-1/2 h-full w-px bg-hairline" />
    </div>
    <div class="flex justify-between text-[11px] text-faint mt-1.5">
      <span>Unlucky</span><span>Baseline</span><span>Lucky</span>
    </div>
    <p class="text-xs text-faint mt-3">{{ note }}</p>
  </div>
</template>
