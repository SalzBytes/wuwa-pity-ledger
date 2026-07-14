<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

// Jump-to-section pill nav. Sticks under the header; highlights the section in
// view via IntersectionObserver (no scroll math). Clicking uses native anchor
// scroll — sections carry scroll-mt so they land below the sticky header.
const props = defineProps<{ sections: { id: string; label: string }[] }>()

const active = ref(props.sections[0]?.id ?? '')
let io: IntersectionObserver | null = null

onMounted(() => {
  io = new IntersectionObserver(
    entries => {
      const vis = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (vis) active.value = vis.target.id
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] }
  )
  props.sections.forEach(s => {
    const el = document.getElementById(s.id)
    if (el) io!.observe(el)
  })
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <nav class="sticky top-[73px] z-20 -mx-4 px-4 py-2 mb-4 bg-void/80 backdrop-blur border-b border-hairline">
    <div class="flex gap-1.5 overflow-x-auto">
      <a
        v-for="s in sections"
        :key="s.id"
        :href="'#' + s.id"
        class="whitespace-nowrap px-3 py-1.5 rounded-full border text-xs font-600 transition"
        :class="active === s.id
          ? 'border-brass text-brassglow bg-panel3'
          : 'border-hairline text-faint hover:text-ink'"
      >{{ s.label }}</a>
    </div>
  </nav>
</template>
