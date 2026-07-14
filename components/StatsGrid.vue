<script setup lang="ts">
import { computed } from 'vue'
import type { Banner } from '~/utils/types'
import { computeStats } from '~/composables/useStats'
import StatCard from './StatCard.vue'

const props = defineProps<{ banner: Banner }>()
const s = computed(() => computeStats(props.banner))
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
    <template v-if="s">
      <StatCard label="Mean" :value="s.mean.toFixed(1)" />
      <StatCard label="Median" :value="s.median" />
      <StatCard label="Mode" :value="s.mode" />
      <StatCard label="Std dev" :value="s.stdDev.toFixed(1)" />
      <StatCard label="Min / Max" :value="`${s.min}–${s.max}`" />
      <StatCard label="Total" :value="s.total" />
    </template>
    <template v-else>
      <StatCard v-for="l in ['Mean','Median','Mode','Std dev','Min / Max','Total']" :key="l" :label="l" value="—" />
    </template>
  </div>
</template>
