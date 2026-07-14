<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Banner } from '~/utils/types'
import { bandOf, chartColor } from '~/utils/bands'
import { samplePrediction } from '~/composables/usePrediction'

const props = defineProps<{ banner: Banner; weightRecent: boolean }>()

// Touch 5★ values so the computed re-runs on any 5★ add/edit/delete. 3★/4★
// convenes share the stream but don't feed the 5★ model, so they're excluded
// to avoid re-running the 10k-draw sim on every tap.
const dataSig = computed(() =>
  props.banner.data.filter(d => (d.rarity ?? 5) === 5).map(d => d.value).join(',')
)

const pred = computed(() => {
  void dataSig.value
  return samplePrediction(props.banner, props.weightRecent)
})


type SortKey = 'value' | 'prob' | 'cumulative'
const sortKey = ref<SortKey>('prob')
const sortDir = ref<1 | -1>(-1) // -1 = desc

function toggleSort(key: SortKey) {
  if (sortKey.value === key) sortDir.value = (sortDir.value * -1) as 1 | -1
  else { sortKey.value = key; sortDir.value = key === 'value' ? 1 : -1 }
}
function arrow(key: SortKey) {
  if (sortKey.value !== key) return ''
  return sortDir.value === 1 ? ' ▲' : ' ▼'
}

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
  const mapped = top.map(d => ({
    value: d.value,
    prob: d.prob,
    cumulative: cumMap[d.value],
    color: chartColor(bandOf(d.value, props.banner)),
    barPct: (d.prob / max) * 100
  }))
  const k = sortKey.value
  return mapped.sort((a, b) => (a[k] - b[k]) * sortDir.value)
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
          <th class="font-600 pb-2">
            <button class="hover:text-ink transition" :class="{ 'text-brassglow': sortKey === 'value' }" @click="toggleSort('value')">Pity{{ arrow('value') }}</button>
          </th>
          <th class="font-600 pb-2">
            <button class="hover:text-ink transition" :class="{ 'text-brassglow': sortKey === 'prob' }" @click="toggleSort('prob')">Chance{{ arrow('prob') }}</button>
          </th>
          <th class="font-600 pb-2 w-1/2">Likelihood</th>
          <th class="font-600 pb-2 text-right">
            <button class="hover:text-ink transition" :class="{ 'text-brassglow': sortKey === 'cumulative' }" @click="toggleSort('cumulative')">By this pull{{ arrow('cumulative') }}</button>
          </th>
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
