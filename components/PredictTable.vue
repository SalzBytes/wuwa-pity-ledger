<script setup lang="ts">
import { computed } from 'vue'
import type { Banner } from '~/utils/types'
import { bandOf, chartColor } from '~/utils/bands'
import { samplePrediction } from '~/composables/usePrediction'

const props = defineProps<{ banner: Banner; weightRecent: boolean }>()

const pred = computed(() => samplePrediction(props.banner, props.weightRecent))

// top pity values by probability; cumulative shows odds of hitting at-or-before
const rows = computed(() => {
  if (!pred.value) return []
  const top = pred.value.distribution.slice(0, 12)
  const max = top[0]?.prob || 1
  // cumulative in pity order (low→high pity)
  const byPity = [...pred.value.distribution].sort((a, b) => a.value - b.value)
  const cumMap: Record<number, number> = {}
  let cum = 0
  byPity.forEach(d => { cum += d.prob; cumMap[d.value] = cum })
  return top.map(d => ({
    value: d.value,
    prob: d.prob,
    cumulative: cumMap[d.value],
    color: chartColor(bandOf(d.value, props.banner)),
    barPct: (d.prob / max) * 100
  }))
})
</script>

<template>
  <div class="bg-panel border border-hairline rounded-2xl p-5 mb-6">
    <div class="flex items-center justify-between mb-3">
      <div class="text-xs uppercase tracking-widest text-faint font-600">Pity probability table</div>
      <div class="text-xs text-faint">10,000 draws · top 12</div>
    </div>

    <p v-if="!rows.length" class="text-sm text-faint py-6 text-center">
      Log a pull to unlock the probability table.
    </p>

    <table v-else class="w-full text-sm">
      <thead>
        <tr class="text-faint text-xs uppercase tracking-wider text-left">
          <th class="font-600 pb-2">Pity</th>
          <th class="font-600 pb-2">Chance</th>
          <th class="font-600 pb-2 w-1/2">Likelihood</th>
          <th class="font-600 pb-2 text-right">By this pull</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.value" class="border-t border-hairline">
          <td class="py-2 font-mono font-700" :style="{ color: r.color }">{{ r.value }}</td>
          <td class="py-2 font-mono">{{ r.prob.toFixed(1) }}%</td>
          <td class="py-2">
            <div class="h-2 rounded-full bg-void border border-hairline overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500" :style="{ width: r.barPct + '%', background: r.color }" />
            </div>
          </td>
          <td class="py-2 font-mono text-faint text-right">{{ r.cumulative.toFixed(1) }}%</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
