<script setup lang="ts">
import { reactive } from 'vue'
import type { Banner } from '~/utils/types'
import { useToast } from '~/composables/useToast'
import ModalShell from './ModalShell.vue'

const props = defineProps<{ banner: Banner; canDelete: boolean }>()
const emit = defineEmits<{
  close: []
  save: [patch: Partial<Banner>]
  'delete-banner': []
}>()
const { showToast } = useToast()

const form = reactive({
  name: props.banner.name,
  maxPity: props.banner.maxPity,
  yellowFrom: props.banner.yellowFrom,
  redFrom: props.banner.redFrom,
  has5050: props.banner.has5050,
  pullCost: props.banner.pullCost
})

function save() {
  if (form.yellowFrom >= form.redFrom || form.redFrom > form.maxPity || form.yellowFrom < 1) {
    showToast('Need 1 ≤ soft pity < hard pity ≤ max.', 'warn')
    return
  }
  emit('save', { ...form, name: form.name.trim() || props.banner.name })
  showToast('Settings saved.', 'good')
  emit('close')
}

function removeBanner() {
  emit('delete-banner')
  emit('close')
}

const fields = [
  { key: 'maxPity', label: 'Max pity (hard cap)' },
  { key: 'yellowFrom', label: 'Soft pity starts at' },
  { key: 'redFrom', label: 'Hard pity starts at' },
  { key: 'pullCost', label: 'Astrite per pull' }
] as const
</script>

<template>
  <ModalShell title="Banner settings" @close="emit('close')">
    <div class="flex flex-col gap-3.5">
      <div>
        <label class="block text-xs text-faint mb-1.5">Banner name</label>
        <input v-model="form.name" type="text" class="w-full bg-void border border-hairline rounded-lg px-3 py-2 text-ink outline-none focus:border-brass" />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div v-for="f in fields" :key="f.key">
          <label class="block text-xs text-faint mb-1.5">{{ f.label }}</label>
          <input v-model.number="form[f.key]" type="number" min="1" class="w-full bg-void border border-hairline rounded-lg px-3 py-2 text-ink font-mono outline-none focus:border-brass" />
        </div>
      </div>
      <label class="flex items-center gap-2 text-sm text-faint cursor-pointer select-none">
        <input v-model="form.has5050" type="checkbox" class="accent-brass w-4 h-4" />
        This banner has a 50/50 mechanic
      </label>
      <div class="flex gap-2 mt-1">
        <button class="flex-1 px-4 py-2.5 rounded-lg bg-brass text-[#241a04] font-700 hover:brightness-110" @click="save">Save settings</button>
        <button
          v-if="canDelete"
          class="px-4 py-2.5 rounded-lg bg-harddim border border-hard/40 text-hard font-600 hover:brightness-110"
          @click="removeBanner"
        >Delete banner</button>
      </div>
    </div>
  </ModalShell>
</template>
