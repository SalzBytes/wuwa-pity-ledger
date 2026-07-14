<script setup lang="ts">
import { computed } from 'vue'
import type { Banner } from '~/utils/types'

// 5★ per-pull odds, driven by the SAME pull stream as 4★. The model: every 4★
// guarantee milestone (each 10th pull) nudges the 5★ rate up a notch, then the
// rate ramps steeply from soft pity to a hard guarantee at maxPity (80).
// So 4★ guarantees "feed" the climbing 5★ rate on the road to 80.
//
// ponytail: this is a shaped heuristic (base + per-10 bumps + soft ramp), not
// datamined 5★ odds. Swap in the exact per-pull curve if precise numbers matter.
const props = defineProps<{ banner: Banner }>()

const BASE = 0.008 // ~0.8% at pull 1
const STEP = 10 // a 4★ guarantee lands every 10 pulls
const BUMP = 0.004 // each 4★-guarantee milestone nudges the 5★ rate up

const soft = computed(() => props.banner.yellowFrom) // 66
const hard = computed(() => props.banner.maxPity) // 80
const pity = computed(() => Math.max(0, Math.min(props.banner.currentPity || 0, hard.value)))

// per-pull 5★ chance at a given pity position (1..hard)
function rateAt(pull: number): number {
  if (pull >= hard.value) return 1
  // base + a step up for every 4★ guarantee milestone crossed so far
  const bumps = Math.floor(pull / STEP) * BUMP
  const flat = BASE + bumps
  if (pull < soft.value) return Math.min(1, flat)
  // steep ramp from soft pity → 1 at hard, starting above the flat rate
  const t = (pull - (soft.value - 1)) / (hard.value - (soft.value - 1))
  return Math.min(1, flat + t * (1 - flat))
}

const rows = computed(() => {
  const out: { pull: number; chance: number; cumulative: number; soft: boolean; guaranteed: boolean; milestone: boolean }[] = []
  let missAll = 1
  for (let p = pity.value + 1; p <= hard.value; p++) {
    const chance = rateAt(p)
    const cumulative = 1 - missAll * (1 - chance)
    missAll *= 1 - chance
    out.push({
      pull: p,
      chance,
      cumulative,
      soft: p >= soft.value && p < hard.value,
      guaranteed: p >= hard.value,
      milestone: p % STEP === 0 && p < hard.value // a 4★ guarantee lands here
    })
  }
  return out
})

const toGuarantee = computed(() => hard.value - pity.value)
</script>

<template>
  <div class="bg-panel border border-hairline rounded-2xl p-5 mb-6">
    <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
      <div class="text-xs uppercase tracking-widest text-faint font-600">5★ rate-up odds</div>
      <div class="text-xs text-faint">base 0.8% · ▲ at each 4★ guarantee (every {{ STEP }}) · soft #{{ soft }} · guaranteed #{{ hard }}</div>
    </div>

    <p class="text-xs text-faint mb-4">
      Reads your live 5★ pity ({{ pity }}/{{ hard }}). Each 4★ guarantee milestone nudges the rate up;
      guaranteed within <span class="text-ink font-700">{{ toGuarantee }}</span> pull{{ toGuarantee === 1 ? '' : 's' }}.
    </p>

    <table class="w-full text-sm">
      <thead>
        <tr class="text-faint text-xs uppercase tracking-wider text-left">
          <th class="font-600 pb-2">Pull</th>
          <th class="font-600 pb-2">This-pull chance</th>
          <th class="font-600 pb-2 w-1/2">At least one by here</th>
          <th class="font-600 pb-2 text-right">Cumulative</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.pull" class="border-t border-hairline">
          <td class="py-1.5 font-mono font-700" :class="r.guaranteed ? 'text-hard' : 'text-ink'">
            #{{ r.pull }}<span v-if="r.guaranteed" class="text-[10px] ml-1">GUARANTEED</span>
            <span v-else-if="r.milestone" class="text-[10px] ml-1 text-soft">4★▲</span>
          </td>
          <td class="py-1.5 font-mono" :class="{ 'text-hard font-700': r.soft }">
            {{ (r.chance * 100).toFixed(r.guaranteed ? 0 : 1) }}%<span v-if="r.soft" class="text-[10px] ml-1">▲ soft</span>
          </td>
          <td class="py-1.5">
            <div class="h-2 rounded-full bg-void border border-hairline overflow-hidden">
              <div class="h-full rounded-full bg-hard transition-all duration-500" :style="{ width: r.cumulative * 100 + '%' }" />
            </div>
          </td>
          <td class="py-1.5 font-mono text-faint text-right">{{ (r.cumulative * 100).toFixed(1) }}%</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
