<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Banner } from '~/utils/types'
import { useFourStar } from '~/composables/useFourStar'

const props = defineProps<{ banner: Banner; guaranteed: boolean }>()
const emit = defineEmits<{
  adjust: [delta: number]
  sync: [val: number]
  'log-five-star': []
  'toggle-guarantee': []
}>()

const syncVal = ref<number | null>(null)

// 4★ pity lives in a shared singleton composable (same store the FourStarOdds
// panel and Pull history read) — no localStorage juggling or storage events here.
const { pity: pity4, FOUR_HARD: FOUR_MAX, setPity: setPity4, pull, undoPull: undo4, logHit } = useFourStar()

const pity4Pct = computed(() => (pity4.value / FOUR_MAX) * 100)
const to4Guarantee = computed(() => FOUR_MAX - pity4.value)

// One convene advances BOTH pities and appends a 3★ to the shared stream
// (auto-upgraded to a guaranteed 4★ on #10). The store owns both counters now,
// so no separate 5★ `adjust` emit here.
function onPull() { pull() }
function undoPull() { undo4() }

// Got a 4★ on the latest pull: log landed pity, reset 4★ counter only.
function log4Star() { logHit() }


const cur = computed(() => Math.max(0, Math.min(props.banner.currentPity || 0, props.banner.maxPity)))

const pct = computed(() => (cur.value / props.banner.maxPity) * 100)
const softPct = computed(() => (props.banner.yellowFrom / props.banner.maxPity) * 100)
const pullsLeft = computed(() => props.banner.maxPity - cur.value)
const astrite = computed(() => (pullsLeft.value * props.banner.pullCost).toLocaleString() + ' Astrite')

function doSync() {
  if (syncVal.value === null) return
  emit('sync', syncVal.value)
  syncVal.value = null
}
</script>

<template>
  <div class="bg-panel border border-hairline rounded-2xl p-5 mb-6">
    <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
      <div class="text-xs uppercase tracking-widest text-faint font-600">Live convene progress</div>
      <button
        v-if="banner.has5050"
        class="text-xs font-700 px-3 py-1 rounded-full transition cursor-pointer border hover:brightness-110"
        :class="guaranteed
          ? 'bg-luckydim text-lucky border-lucky/40'
          : 'bg-softdim text-soft border-soft/40'"
        @click="emit('toggle-guarantee')"
      >
        {{ guaranteed ? '🔒 Guaranteed — next 5★ is featured' : '🎲 50/50 active — tap if you\'re guaranteed' }}
      </button>
    </div>

    <div class="flex flex-wrap items-center gap-5">
      <div class="flex items-baseline gap-1.5">
        <span class="led text-4xl text-brassglow">{{ cur }}</span>
        <span class="text-faint text-sm">/ {{ banner.maxPity }} pulls</span>
      </div>
      <div class="flex-1 min-w-[160px]">
        <div class="h-3 rounded-full bg-void border border-hairline overflow-hidden relative">
          <div class="h-full bg-gradient-to-r from-lucky via-soft to-hard transition-all duration-300" :style="{ width: pct + '%' }" />
          <div class="absolute top-0 h-full w-px bg-brassglow/70" :style="{ left: softPct + '%' }" />
        </div>
        <div class="flex justify-between text-[11px] text-faint mt-1">
          <span>0</span>
          <span>soft pity ({{ banner.yellowFrom }})</span>
          <span>{{ banner.maxPity }}</span>
        </div>
      </div>
      <div class="flex items-center gap-1.5">
        <button class="w-9 h-9 rounded-full bg-panel2 border border-hairline text-ink hover:border-brassdim font-700" @click="undoPull">−</button>
        <button class="w-9 h-9 rounded-full bg-panel2 border border-hairline text-ink hover:border-brassdim font-700" @click="onPull">+</button>
        <button class="px-4 py-2 rounded-full bg-hard text-[#2a0509] font-700 hover:brightness-110 active:scale-95 transition text-sm" @click="emit('log-five-star')">⭑ Got the 5-star!</button>
      </div>
    </div>

    <p class="text-xs text-faint mt-2">
      Tap <span class="text-ink font-600">+</span> once per pull — it advances <span class="text-ink font-600">both</span> the 5★ and 4★ pity.
      Hit <span class="text-ink font-600">Got the 5-star!</span> or <span class="text-soft font-600">Got a 4★!</span> to log it and reset that counter.
    </p>


    <!-- 4★ pity — guaranteed every 10 -->
    <div class="mt-4 pt-4 border-t border-hairline">
      <div class="flex flex-wrap items-center gap-5">
        <div class="flex items-baseline gap-1.5">
          <span class="led text-2xl text-soft">{{ pity4 }}</span>
          <span class="text-faint text-sm">/ {{ FOUR_MAX }} · 4★ pity</span>
        </div>
        <div class="flex-1 min-w-[160px]">
          <div class="h-2.5 rounded-full bg-void border border-hairline overflow-hidden">
            <div class="h-full bg-soft transition-all duration-300" :style="{ width: pity4Pct + '%' }" />
          </div>
          <div class="text-[11px] text-faint mt-1">
            Guaranteed 4★ in {{ to4Guarantee }} pull{{ to4Guarantee === 1 ? '' : 's' }}
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <button class="w-8 h-8 rounded-full bg-panel2 border border-hairline text-ink hover:border-brassdim font-700" title="manual fix" @click="setPity4(pity4 - 1)">−</button>
          <button class="w-8 h-8 rounded-full bg-panel2 border border-hairline text-ink hover:border-brassdim font-700" title="manual fix" @click="setPity4(pity4 + 1)">+</button>

          <button class="px-3 py-1.5 rounded-full bg-soft/15 border border-soft/40 text-soft font-700 hover:bg-soft/25 transition text-sm" @click="log4Star">✦ Got a 4★!</button>
        </div>
      </div>
    </div>


    <div class="flex flex-wrap items-center justify-between gap-3 mt-3 pt-4 border-t border-hairline">
      <div class="text-sm text-faint">
        Astrite to guarantee: <span class="text-ink font-700 font-mono">{{ astrite }}</span>
        <span class="text-faint/70">({{ pullsLeft }} pulls left · {{ banner.pullCost }} Astrite/pull)</span>
      </div>
      <div class="flex items-center gap-2 text-xs">
        <span class="text-faint">Sync counter:</span>
        <input
          v-model.number="syncVal"
          type="number"
          min="0"
          :placeholder="String(cur)"
          class="w-16 bg-void border border-hairline rounded-lg px-2 py-1 text-ink outline-none focus:border-brass font-mono"
          @keydown.enter="doSync"
        />
        <button class="px-3 py-1 rounded-full bg-panel2 border border-hairline text-faint hover:text-ink hover:border-brassdim" @click="doSync">Set</button>
      </div>
    </div>
  </div>
</template>
