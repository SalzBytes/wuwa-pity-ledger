<script setup lang="ts">
defineProps<{ label: string; value: string | number }>()
</script>

<template>
  <div class="bg-panel border border-hairline rounded-xl px-3.5 py-3 text-center">
    <div class="text-[10px] uppercase tracking-widest text-faint font-600">{{ label }}</div>
    <div class="text-xl font-700 font-mono text-ink mt-0.5">{{ value }}</div>
  </div>
</template>
