<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Band, Banner } from '~/utils/types'
import { bandOf } from '~/utils/bands'

const props = defineProps<{ banner: Banner }>()
const emit = defineEmits<{ edit: [idx: number]; delete: [idx: number] }>()

const chipCls: Record<string, string> = {
  green: 'bg-luckydim border-lucky/40 text-lucky',
  yellow: 'bg-softdim border-soft/40 text-soft',
  red: 'bg-harddim border-hard/40 text-hard'
}

const filter = ref<'all' | Band>('all')
const filters: { key: 'all' | Band; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'green', label: 'Lucky' },
  { key: 'yellow', label: 'Soft' },
  { key: 'red', label: 'Hard' }
]

// data is newest-first; number them by real chronological order
const entries = computed(() =>
  props.banner.data
    .map((d, idx) => ({
      idx,
      value: d.value,
      won: d.won,
      band: bandOf(d.value, props.banner),
      ordinal: props.banner.data.length - idx
    }))
    .filter(e => filter.value === 'all' || e.band === filter.value)
)
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
          >{{ f.label }}</button>
        </div>
        <div class="text-xs text-faint">{{ banner.data.length }} logged · newest first</div>
      </div>
    </div>

    <p v-if="!banner.data.length" class="text-sm text-faint py-6 text-center">
      No pulls yet. Log a 5★ above and it'll show up here.
    </p>

    <p v-else-if="!entries.length" class="text-sm text-faint py-6 text-center">
      No pulls match this filter.
    </p>

    <div v-else class="flex flex-wrap gap-2">
      <div
        v-for="e in entries"
        :key="e.idx"
        class="group relative rounded-xl border px-3 py-2 text-center min-w-[58px]"
        :class="chipCls[e.band]"
      >
        <div class="text-[10px] opacity-60">#{{ e.ordinal }}</div>
        <div class="font-700 font-mono text-lg leading-none">{{ e.value }}</div>
        <div v-if="banner.has5050 && e.won !== null" class="text-[10px] mt-0.5">
          {{ e.won ? 'won' : 'lost' }}
        </div>
        <div class="absolute -top-2 -right-2 hidden group-hover:flex gap-1">
          <button class="w-5 h-5 rounded-full bg-panel2 border border-hairline text-ink text-[10px] hover:border-brass" @click="emit('edit', e.idx)">✎</button>
          <button class="w-5 h-5 rounded-full bg-panel2 border border-hairline text-hard text-[10px] hover:border-hard" @click="emit('delete', e.idx)">✕</button>
        </div>
      </div>
    </div>
  </div>
</template>
