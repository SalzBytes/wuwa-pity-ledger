<script setup lang="ts">
import { computed } from 'vue'
import type { Banner } from '~/utils/types'
import { computeInsights } from '~/composables/useStats'
import StatCard from './StatCard.vue'

const props = defineProps<{ banner: Banner }>()
const i = computed(() => computeInsights(props.banner))
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
    <template v-if="i">
      <StatCard label="Hard pity hits" :value="`${i.hardCount} / ${i.total}`" />
      <StatCard label="Longest lucky run" :value="i.longestGreenRun" />
      <StatCard label="Avg gap btwn hard" :value="i.avgGap" />
      <StatCard label="50/50 win rate" :value="i.winRate" />
    </template>
    <template v-else>
      <StatCard v-for="l in ['Hard pity hits','Longest lucky run','Avg gap between hard pity','50/50 win rate']" :key="l" :label="l" value="—" />
    </template>
  </div>
</template>
