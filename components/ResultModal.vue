<script setup lang="ts">
import ModalShell from './ModalShell.vue'

defineProps<{ value: number }>()
const emit = defineEmits<{ close: []; resolve: [won: boolean] }>()
</script>

<template>
  <ModalShell title="Was it the featured Resonator?" @close="emit('close')">
    <p class="text-xs text-faint mb-5">
      This banner has a 50/50 — losing guarantees the featured unit next time.
      You hit your 5★ at pity <span class="text-ink font-700 font-mono">{{ value }}</span>.
    </p>
    <div class="flex gap-3">
      <button class="flex-1 px-4 py-3 rounded-xl bg-lucky text-[#062012] font-700 hover:brightness-110" @click="emit('resolve', true)">✅ Featured</button>
      <button class="flex-1 px-4 py-3 rounded-xl bg-hard text-[#2a0509] font-700 hover:brightness-110" @click="emit('resolve', false)">❌ Standard</button>
    </div>
  </ModalShell>
</template>
