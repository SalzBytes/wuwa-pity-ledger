<script setup lang="ts">
import type { Banner } from '~/utils/types'

defineProps<{ banners: Banner[]; activeId: string }>()
const emit = defineEmits<{ select: [id: string]; 'new-banner': [] }>()
</script>

<template>
  <div class="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
    <button
      v-for="b in banners"
      :key="b.id"
      class="px-4 py-2 rounded-full text-sm font-600 border whitespace-nowrap transition"
      :class="b.id === activeId
        ? 'tab-active'
        : 'border-hairline text-faint hover:text-ink hover:border-brassdim bg-panel'"
      @click="emit('select', b.id)"
    >
      {{ b.name }}
    </button>
    <button
      class="px-4 py-2 rounded-full text-sm font-600 border border-dashed border-hairline text-faint hover:text-brass hover:border-brass transition whitespace-nowrap"
      @click="emit('new-banner')"
    >
      + New banner
    </button>
  </div>
</template>
