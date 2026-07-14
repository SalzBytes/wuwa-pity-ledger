<script setup lang="ts">
import { computed } from 'vue'
import type { Banner } from '~/utils/types'
import { bandOf } from '~/utils/bands'

const props = defineProps<{ banner: Banner }>()

const rows = computed(() => {
  const b = props.banner
  const values = b.data.filter(d => (d.rarity ?? 5) === 5).map(d => d.value)

  const n = values.length || 1
  const defs = [
    { key: 'green', label: 'Lucky', range: `< ${b.yellowFrom}`, cls: 'bg-lucky' },
    { key: 'yellow', label: 'Soft pity', range: `${b.yellowFrom}–${b.redFrom - 1}`, cls: 'bg-soft' },
    { key: 'red', label: 'Hard pity', range: `≥ ${b.redFrom}`, cls: 'bg-hard' }
  ] as const
  return defs.map(d => {
    const count = values.filter(v => bandOf(v, b) === d.key).length
    const pct = values.length ? (count / n) * 100 : 0
    return { ...d, pct, has: values.length > 0 }
  })
})
</script>

<template>
  <div class="bg-panel border border-hairline rounded-2xl p-5">
    <div class="text-xs uppercase tracking-widest text-faint font-600 mb-3">Outcome distribution</div>
    <div class="flex flex-col gap-2.5">
      <div v-for="r in rows" :key="r.key">
        <div class="flex justify-between text-sm mb-1">
          <span class="text-faint">{{ r.label }} <span class="text-faint/70">({{ r.range }})</span></span>
          <span class="font-700 font-mono">{{ r.has ? r.pct.toFixed(1) + '%' : '—' }}</span>
        </div>
        <div class="h-2.5 rounded-full bg-void border border-hairline overflow-hidden">
          <div class="h-full rounded-full transition-all duration-500" :class="r.cls" :style="{ width: r.pct + '%' }" />
        </div>
      </div>
    </div>
  </div>
</template>
