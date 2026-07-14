<script setup lang="ts">
import { useToast } from '~/composables/useToast'
const { toasts } = useToast()
const cls: Record<string, string> = {
  info: 'border-hairline text-ink',
  good: 'border-lucky text-lucky',
  warn: 'border-hard text-hard'
}
</script>

<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 items-end">
    <div
      v-for="t in toasts"
      :key="t.id"
      class="toast-anim bg-panel2 border rounded-xl px-4 py-2.5 text-sm shadow-lg"
      :class="cls[t.kind]"
    >
      {{ t.msg }}
    </div>
  </div>
</template>
