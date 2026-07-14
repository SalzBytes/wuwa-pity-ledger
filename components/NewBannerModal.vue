<script setup lang="ts">
import { ref, computed } from 'vue'
import { BANNER_PRESETS } from '~/utils/presets'
import { useToast } from '~/composables/useToast'
import ModalShell from './ModalShell.vue'

const emit = defineEmits<{ close: []; create: [name: string, type: string] }>()
const { showToast } = useToast()

const type = ref('character')
const name = ref('')

const presetList = computed(() =>
  Object.entries(BANNER_PRESETS).map(([key, p]) => ({ key, label: p.label }))
)

function submit() {
  const finalName = name.value.trim() || BANNER_PRESETS[type.value].label
  emit('create', finalName, type.value)
  showToast(`Banner "${finalName}" created.`, 'good')
  emit('close')
}
</script>

<template>
  <ModalShell title="New banner" @close="emit('close')">
    <div class="flex flex-col gap-4">
      <div>
        <label class="block text-xs text-faint mb-1.5">Type (loads sensible presets)</label>
        <select v-model="type" class="w-full bg-void border border-hairline rounded-lg px-3 py-2 text-ink outline-none focus:border-brass">
          <option v-for="p in presetList" :key="p.key" :value="p.key">{{ p.label }}</option>
        </select>
      </div>
      <div>
        <label class="block text-xs text-faint mb-1.5">Name (optional)</label>
        <input
          v-model="name"
          type="text"
          :placeholder="BANNER_PRESETS[type].label"
          class="w-full bg-void border border-hairline rounded-lg px-3 py-2 text-ink outline-none focus:border-brass"
          @keydown.enter="submit"
        />
      </div>
      <button class="mt-1 px-4 py-2.5 rounded-lg bg-brass text-[#241a04] font-700 hover:brightness-110 transition" @click="submit">
        Create banner
      </button>
    </div>
  </ModalShell>
</template>
