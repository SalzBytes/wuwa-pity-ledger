<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Band, Banner } from '~/utils/types'
import { bandOf } from '~/utils/bands'
import { useFourStar } from '~/composables/useFourStar'

// Which 10-pull multi a record falls in, by its pity value:
// 1..10 → 10, 11..20 → 20, … 71..80 → 80, then wraps back to 10.
const batchOf = (v: number) => (((Math.ceil(v / 10) - 1) % 8) * 10) + 10




type Filter = 'all' | 'star5' | Band | 'star4' | 'star3'


const props = defineProps<{ banner: Banner }>()
const emit = defineEmits<{ edit: [idx: number]; delete: [idx: number] }>()

// 5★ records only, newest-first — edit/delete address this filtered index.
const fiveData = computed(() => props.banner.data.filter(d => (d.rarity ?? 5) === 5))
// 3★ pity positions, newest-first
const three = computed(() => props.banner.data.filter(d => d.rarity === 3).map(d => d.value))


const chipCls: Record<string, string> = {
  green: 'bg-luckydim border-lucky/40 text-lucky',
  yellow: 'bg-softdim border-soft/40 text-soft',
  red: 'bg-harddim border-hard/40 text-hard'
}

const filter = ref<Filter>('all')

// 4★ history from the shared store. Entry = pity a 4★ landed at (1..10);
// 10 = rate-up guarantee. Logging happens in the Live tracker.
const { history: star4, removeAt: removeStar4 } = useFourStar()




// per-band chip badge counts (5★ only)
const counts = computed(() => {
  const c: Record<'all' | Band, number> = { all: fiveData.value.length, green: 0, yellow: 0, red: 0 }
  for (const d of fiveData.value) c[bandOf(d.value, props.banner)]++
  return c
})

const filters = computed<{ key: Filter; label: string; count: number }[]>(() => [
  { key: 'all', label: 'All', count: counts.value.all + star4.value.length + three.value.length },
  { key: 'green', label: 'Lucky', count: counts.value.green },
  { key: 'yellow', label: 'Soft', count: counts.value.yellow },
  { key: 'red', label: 'Hard', count: counts.value.red },
  { key: 'star5', label: '5★', count: counts.value.all },
  { key: 'star4', label: '4★', count: star4.value.length },
  { key: 'star3', label: '3★', count: three.value.length }
])

// unified chip model — 3★/4★/5★ share one ordered stream now. 5★ carry a band
// colour + edit/delete; 4★ soft-tinted, delete-only; 3★ plain, read-only.
// "All" sorts by rarity ascending (3 → 4 → 5) as requested.

type Chip =
  | { star: 5; idx: number; value: number; won: boolean | null; band: Band; ordinal: number; batch: number }
  | { star: 4; idx: number; value: number; ordinal: number; batch: number }
  | { star: 3; idx: number; value: number; ordinal: number; batch: number }

const fiveChips = computed<Chip[]>(() =>
  fiveData.value.map((d, idx) => ({
    star: 5 as const,
    idx,
    value: d.value,
    won: d.won,
    band: bandOf(d.value, props.banner),
    ordinal: fiveData.value.length - idx,
    batch: batchOf(d.value)
  }))
)
const fourChips = computed<Chip[]>(() =>
  star4.value.map((v, idx) => ({ star: 4 as const, idx, value: v, ordinal: star4.value.length - idx, batch: batchOf(v) }))
)


const threeChips = computed<Chip[]>(() =>
  three.value.map((v, idx) => ({ star: 3 as const, idx, value: v, ordinal: three.value.length - idx, batch: batchOf(v) }))
)


const chips = computed<Chip[]>(() => {
  const f = filter.value
  if (f === 'star4') return fourChips.value
  if (f === 'star3') return threeChips.value
  if (f === 'star5') return fiveChips.value
  // All: 3★ first, then 4★, then 5★ (rarity ascending)
  if (f === 'all') return [...threeChips.value, ...fourChips.value, ...fiveChips.value]
  return fiveChips.value.filter(c => c.star === 5 && c.band === f)
})
</script>



<template>
  <div class="bg-panel border border-hairline rounded-2xl p-5">
    <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
      <div class="text-xs uppercase tracking-widest text-faint font-600">Pull history</div>
      <div class="flex items-center gap-3 flex-wrap">
        <div class="flex gap-1.5 text-xs">
          <button
            v-for="f in filters"
            :key="f.key"
            class="px-3 py-1.5 rounded-full border transition"
            :class="filter === f.key
              ? 'border-brass text-brassglow bg-panel3'
              : 'border-hairline text-faint hover:text-ink'"
            @click="filter = f.key"
          >{{ f.label }}<span class="ml-1 opacity-60">{{ f.count }}</span></button>

        </div>
        <div class="text-xs text-faint">
          {{ chips.length }} shown · newest first
        </div>
      </div>
    </div>

    <p v-if="!chips.length" class="text-sm text-faint py-6 text-center">
      Nothing here yet. Log 5★ and 4★ above and they'll show up combined.
    </p>

    <div v-else class="flex flex-wrap gap-2">
      <div
        v-for="c in chips"
        :key="c.star + '-' + c.idx"
        class="group relative rounded-xl border px-3 py-2 text-center min-w-[58px]"
        :class="c.star === 5 ? chipCls[c.band] : c.star === 4 ? (c.value >= 10 ? 'bg-softdim border-soft/40 text-soft' : 'bg-panel2 border-hairline text-ink') : 'bg-panel2 border-hairline text-faint'"
      >
        <div class="text-[10px] opacity-60">{{ c.star }}★ #{{ c.ordinal }}</div>
        <div class="font-700 font-mono text-lg leading-none">{{ c.value }}</div>
        <div class="absolute -top-1.5 -left-1.5 px-1 rounded-full bg-brass/90 text-[#241a04] text-[9px] font-700 leading-tight" :title="`falls in the ${c.batch}-pull multi (pity ${c.value})`">{{ c.batch }}</div>

        <div v-if="c.star === 5 && banner.has5050 && c.won !== null" class="text-[10px] mt-0.5">
          {{ c.won ? 'won' : 'lost' }}
        </div>
        <div v-else-if="c.star === 4 && c.value >= 10" class="text-[10px] mt-0.5">rate-up</div>

        <!-- 5★ edit + delete -->
        <div v-if="c.star === 5" class="absolute -top-2 -right-2 hidden group-hover:flex gap-1">
          <button class="w-5 h-5 rounded-full bg-panel2 border border-hairline text-ink text-[10px] hover:border-brass" @click="emit('edit', c.idx)">✎</button>
          <button class="w-5 h-5 rounded-full bg-panel2 border border-hairline text-hard text-[10px] hover:border-hard" @click="emit('delete', c.idx)">✕</button>
        </div>
        <!-- 4★ delete only (3★ are read-only) -->
        <button v-else-if="c.star === 4" class="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-panel2 border border-hairline text-hard text-[10px] hidden group-hover:flex items-center justify-center hover:border-hard" @click="removeStar4(c.idx)">✕</button>



      </div>
    </div>
  </div>
</template>
