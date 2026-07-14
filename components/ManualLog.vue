<script setup lang="ts">
import { ref } from 'vue'
import type { Banner } from '~/utils/types'
import { useToast } from '~/composables/useToast'

const props = defineProps<{ banner: Banner }>()
const emit = defineEmits<{ add: [value: number, won: boolean | null] }>()
const { showToast } = useToast()

const val = ref<number | null>(null)
const won = ref<boolean | null>(true)

function submit() {
  if (val.value === null || val.value < 1 || val.value > props.banner.maxPity) {
    showToast(`Enter a pity between 1 and ${props.banner.maxPity}.`, 'warn')
    return
  }
  emit('add', val.value, props.banner.has5050 ? won.value : null)
  val.value = null
  won.value = true
}
</script>

<template>
  <div class="bg-panel border border-hairline rounded-2xl p-5 mb-6">
    <div class="text-xs uppercase tracking-widest text-faint font-600 mb-3">Log a past 5★ manually</div>
    <div class="flex flex-wrap items-end gap-3">
      <div>
        <label class="block text-[11px] text-faint mb-1">Pity count</label>
        <input
          v-model.number="val"
          type="number"
          min="1"
          :max="banner.maxPity"
          placeholder="e.g. 62"
          class="w-24 bg-void border border-hairline rounded-lg px-3 py-2 text-ink font-mono outline-none focus:border-brass"
          @keydown.enter="submit"
        />
      </div>
      <div v-if="banner.has5050">
        <label class="block text-[11px] text-faint mb-1">50/50</label>
        <div class="flex rounded-lg overflow-hidden border border-hairline">
          <button
            class="px-3 py-2 text-sm font-600 transition"
            :class="won === true ? 'bg-luckydim text-lucky' : 'bg-void text-faint hover:text-ink'"
            @click="won = true"
          >Won</button>
          <button
            class="px-3 py-2 text-sm font-600 transition border-l border-hairline"
            :class="won === false ? 'bg-harddim text-hard' : 'bg-void text-faint hover:text-ink'"
            @click="won = false"
          >Lost</button>
        </div>
      </div>
      <button class="px-4 py-2 rounded-lg bg-panel2 border border-hairline text-ink hover:border-brass font-600 transition" @click="submit">
        + Add entry
      </button>
    </div>
  </div>
</template>
