<script setup lang="ts">
defineProps<{ title: string }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <div class="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="emit('close')">
    <div class="modal-anim w-full max-w-md bg-panel2 border border-hairline rounded-2xl p-6 shadow-2xl">
      <div class="flex items-center justify-between mb-5">
        <h3 class="font-display text-lg text-ink">{{ title }}</h3>
        <button class="w-7 h-7 rounded-full bg-panel border border-hairline text-faint hover:text-ink" @click="emit('close')">✕</button>
      </div>
      <slot />
    </div>
  </div>
</template>
