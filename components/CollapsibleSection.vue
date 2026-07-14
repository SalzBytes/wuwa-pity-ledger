<script setup lang="ts">
// Collapsible section built on native <details>/<summary> — no JS state, keyboard
// + a11y for free. `open` seeds the initial state; user toggles persist in the
// element. Scrollspy still targets the outer id (passed by parent <section>).
defineProps<{ title: string; open?: boolean }>()
</script>

<template>
  <details class="group mb-6 rounded-2xl border border-hairline bg-panel/40 overflow-hidden" :open="open ?? true">
    <summary
      class="flex items-center justify-between gap-3 cursor-pointer select-none list-none px-4 sm:px-5 py-3
             hover:bg-panel2/50 transition [&::-webkit-details-marker]:hidden"
    >
      <span class="text-xs sm:text-sm uppercase tracking-widest text-faint font-700">{{ title }}</span>
      <svg
        class="w-4 h-4 text-faint shrink-0 transition-transform duration-200 group-open:rotate-180"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
      >
        <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </summary>
    <div class="px-4 sm:px-5 pb-5 pt-1">
      <slot />
    </div>
  </details>
</template>
