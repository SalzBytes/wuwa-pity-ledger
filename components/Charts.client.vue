<script setup lang="ts">
import { computed } from 'vue'
import type { Banner } from '~/utils/types'
import { bandOf, chartColor } from '~/utils/bands'
import {
  Chart as ChartJS,
  BarElement,
  PointElement,
  LineElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler
} from 'chart.js'
import { Bar, Line } from 'vue-chartjs'

ChartJS.register(BarElement, PointElement, LineElement, LinearScale, CategoryScale, Tooltip, Filler)

const props = defineProps<{ banner: Banner }>()

const gridColor = 'rgba(255,255,255,0.05)'
const tickColor = '#6d7891'

const hasData = computed(() => props.banner.data.length > 0)

// histogram binned into 5-pull buckets
const histogram = computed(() => {
  const b = props.banner
  const binSize = 5
  const binCount = Math.ceil(b.maxPity / binSize)
  const counts = new Array(binCount).fill(0)
  b.data.forEach(d => {
    const idx = Math.min(binCount - 1, Math.floor((d.value - 1) / binSize))
    counts[idx]++
  })
  const labels = counts.map((_, i) => `${i * binSize + 1}-${Math.min((i + 1) * binSize, b.maxPity)}`)
  const colors = counts.map((_, i) => chartColor(bandOf(Math.min((i + 1) * binSize, b.maxPity), b)))
  return {
    labels,
    datasets: [{ data: counts, backgroundColor: colors, borderRadius: 4, maxBarThickness: 34 }]
  }
})

// chronological pity over time
const timeline = computed(() => {
  const b = props.banner
  const chrono = [...b.data].reverse()
  return {
    labels: chrono.map((_, i) => `#${i + 1}`),
    datasets: [
      {
        data: chrono.map(d => d.value),
        borderColor: '#d9ac4f',
        backgroundColor: 'rgba(217,172,79,0.12)',
        pointBackgroundColor: chrono.map(d => chartColor(bandOf(d.value, b))),
        pointRadius: 4,
        tension: 0.3,
        fill: true
      }
    ]
  }
})

const barOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: tickColor, font: { size: 10 } } },
    y: { grid: { color: gridColor }, ticks: { color: tickColor, precision: 0 }, beginAtZero: true }
  }
}
const lineOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: tickColor, font: { size: 10 } } },
    y: { grid: { color: gridColor }, ticks: { color: tickColor }, min: 0, max: props.banner.maxPity }
  }
}
</script>

<template>
  <div class="grid lg:grid-cols-2 gap-4 mb-6">
    <div class="bg-panel border border-hairline rounded-2xl p-5">
      <div class="text-xs uppercase tracking-widest text-faint font-600 mb-3">Pity distribution</div>
      <div class="h-56">
        <Bar v-if="hasData" :data="histogram" :options="barOpts" />
        <div v-else class="h-full flex items-center justify-center text-sm text-faint">No data yet</div>
      </div>
    </div>
    <div class="bg-panel border border-hairline rounded-2xl p-5">
      <div class="text-xs uppercase tracking-widest text-faint font-600 mb-3">Pity over time</div>
      <div class="h-56">
        <Line v-if="hasData" :data="timeline" :options="lineOpts" />
        <div v-else class="h-full flex items-center justify-center text-sm text-faint">No data yet</div>
      </div>
    </div>
  </div>
</template>
