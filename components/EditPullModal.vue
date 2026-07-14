<script setup lang="ts">
import { ref } from 'vue'
import type { Banner } from '~/utils/types'
import { useToast } from '~/composables/useToast'
import ModalShell from './ModalShell.vue'

const props = defineProps<{ banner: Banner; index: number }>()
const emit = defineEmits<{
  close: []
  save: [idx: number, value: number, won: boolean | null]
  remove: [idx: number]
}>()
const { showToast } = useToast()

// `index` is the 5★-only position (HistoryGrid/useLedger address 5★ that way),
// so resolve it against the 5★ subset of the unified stream.
const pull = props.banner.data.filter(d => (d.rarity ?? 5) === 5)[props.index]

const val = ref<number | null>(pull ? pull.value : null)
const won = ref<boolean | null>(pull ? pull.won : true)

function save() {
  if (val.value === null || val.value < 1 || val.value > props.banner.maxPity) {
    showToast(`Enter a pity between 1 and ${props.banner.maxPity}.`, 'warn')
    return
  }
  emit('save', props.index, val.value, props.banner.has5050 ? won.value : null)
  emit('close')
}
function del() {
  emit('remove', props.index)
  emit('close')
}
</script>

<template>
  <ModalShell title="Edit pull" @close="emit('close')">
    <div class="flex flex-col gap-4">
      <div>
        <label class="block text-xs text-faint mb-1.5">Pity count</label>
        <input
          v-model.number="val"
          type="number"
          min="1"
          :max="banner.maxPity"
          class="w-full bg-void border border-hairline rounded-lg px-3 py-2 text-ink font-mono outline-none focus:border-brass"
          @keydown.enter="save"
        />
      </div>
      <div v-if="banner.has5050">
        <label class="block text-xs text-faint mb-1.5">50/50 result</label>
        <div class="flex rounded-lg overflow-hidden border border-hairline w-max">
          <button class="px-4 py-2 text-sm font-600" :class="won === true ? 'bg-luckydim text-lucky' : 'bg-void text-faint'" @click="won = true">Won</button>
          <button class="px-4 py-2 text-sm font-600 border-l border-hairline" :class="won === false ? 'bg-harddim text-hard' : 'bg-void text-faint'" @click="won = false">Lost</button>
        </div>
      </div>
      <div class="flex gap-2 mt-1">
        <button class="flex-1 px-4 py-2.5 rounded-lg bg-brass text-[#241a04] font-700 hover:brightness-110" @click="save">Save</button>
        <button class="px-4 py-2.5 rounded-lg bg-harddim border border-hard/40 text-hard font-600 hover:brightness-110" @click="del">Delete</button>
      </div>
    </div>
  </ModalShell>
</template>
