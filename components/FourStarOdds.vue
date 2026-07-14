<script setup lang="ts">
import { computed } from 'vue'
import { useFourStar } from '~/composables/useFourStar'

// Shared 4★ state — the Live tracker logs pulls/hits, this panel reads the
// same pity and shows the per-pull odds. Single source, no localStorage here.
const { pity, history, FOUR_HARD, setPity } = useFourStar()


// WuWa 4★ pity: base 6% per pull. Each pull without a 4★ raises the NEXT
// pull's rate (soft pity), climbing steeply near the end to a hard guarantee
// on the 10th pull since the last 4★.
// ponytail: soft pity modeled as base until SOFT, then a linear ramp SOFT→HARD;
// swap in the exact datamined per-pull curve if precise odds are needed.
const BASE = 0.06
const SOFT = 8 // steep ramp begins here
const HARD = FOUR_HARD // forced 4★

// per-pull 4★ chance at a given pity position (1..10). Rate rises every pull:
// a gentle creep up to SOFT, then a steep ramp to the guarantee.
function rateAt(pull: number): number {
  if (pull >= HARD) return 1
  if (pull < SOFT) {
    // gentle creep: +1% per pull before soft pity (6%,7%,…)
    return BASE + (pull - 1) * 0.01
  }
  // steep ramp: from the creep's last value at SOFT-1 up to 1 at HARD
  const preSoft = BASE + (SOFT - 2) * 0.01
  const t = (pull - (SOFT - 1)) / (HARD - (SOFT - 1))
  return Math.min(1, preSoft + t * (1 - preSoft))
}


const rows = computed(() => {

  const out: { pull: number; chance: number; cumulative: number; soft: boolean; guaranteed: boolean }[] = []
  let missAll = 1 // P(no 4★ yet) from current pity onward
  for (let p = pity.value + 1; p <= HARD; p++) {
    const chance = rateAt(p)
    const cumulative = 1 - missAll * (1 - chance)
    missAll *= (1 - chance)
    out.push({ pull: p, chance, cumulative, soft: p >= SOFT && p < HARD, guaranteed: p >= HARD })
  }
  return out
})


const pullsToGuarantee = computed(() => HARD - pity.value)

// read-only badge; logging happens in the Live tracker
const historyCount = computed(() => history.value.length)
</script>





<template>
  <div class="bg-panel border border-hairline rounded-2xl p-5 mb-6">
    <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
      <div class="text-xs uppercase tracking-widest text-faint font-600">4★ rate-up odds</div>
      <div class="text-xs text-faint">base 6% · ramps from #{{ SOFT }} · guaranteed #10</div>

    </div>

    <div class="flex items-center gap-3 mb-4 flex-wrap">
      <label class="text-sm text-faint">Pulls since last 4★</label>
      <div class="flex items-center gap-1">
        <button class="w-7 h-7 rounded-lg bg-panel2 border border-hairline text-ink hover:border-brass" @click="setPity(pity - 1)">−</button>
        <span class="w-9 text-center font-mono font-700 text-lg text-brassglow">{{ pity }}</span>
        <button class="w-7 h-7 rounded-lg bg-panel2 border border-hairline text-ink hover:border-brass" @click="setPity(pity + 1)">+</button>

      </div>
      <span class="text-xs text-faint">→ guaranteed within {{ pullsToGuarantee }} pull{{ pullsToGuarantee === 1 ? '' : 's' }}</span>
      <span class="ml-auto text-[11px] text-faint">Log 4★ from the Live tracker above ↑</span>
    </div>



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
          <td class="py-1.5 font-mono font-700" :class="r.guaranteed ? 'text-soft' : 'text-ink'">
            #{{ r.pull }}<span v-if="r.guaranteed" class="text-[10px] ml-1">GUARANTEED</span>
          </td>
          <td class="py-1.5 font-mono" :class="{ 'text-soft font-700': r.soft }">
            {{ (r.chance * 100).toFixed(r.guaranteed ? 0 : 1) }}%<span v-if="r.soft" class="text-[10px] ml-1">▲ soft</span>
          </td>

          <td class="py-1.5">
            <div class="h-2 rounded-full bg-void border border-hairline overflow-hidden">
              <div class="h-full rounded-full bg-soft transition-all duration-500" :style="{ width: r.cumulative * 100 + '%' }" />
            </div>
          </td>
          <td class="py-1.5 font-mono text-faint text-right">{{ (r.cumulative * 100).toFixed(1) }}%</td>
        </tr>
      </tbody>
    </table>

    <p class="text-[11px] text-faint mt-3">
      Logged 4★ appear in the Pull history below under the <span class="text-soft font-600">4★</span> filter · {{ historyCount }} logged

    </p>
  </div>
</template>
