import type { Banner } from '~/utils/types'
import { bandOf } from '~/utils/bands'

export function mean(arr: number[]): number {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
}

export function stdDev(arr: number[], m: number): number {
  if (arr.length < 2) return 0
  return Math.sqrt(arr.reduce((s, x) => s + (x - m) * (x - m), 0) / (arr.length - 1))
}

export function median(sorted: number[]): number {
  const n = sorted.length
  if (!n) return 0
  const mid = Math.floor(n / 2)
  return n % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

export interface Stats {
  mean: number
  median: number
  mode: number
  stdDev: number
  min: number
  max: number
  total: number
}

export function computeStats(banner: Banner): Stats | null {
  const values = banner.data.map(d => d.value)
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  const m = mean(values)
  const freqMap: Record<number, number> = {}
  values.forEach(v => (freqMap[v] = (freqMap[v] || 0) + 1))
  let mode = values[0]
  let maxFreq = 0
  for (const [k, v] of Object.entries(freqMap)) {
    if (v > maxFreq) {
      maxFreq = v
      mode = Number(k)
    }
  }
  return {
    mean: m,
    median: median(sorted),
    mode,
    stdDev: stdDev(values, m),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    total: values.length
  }
}

export interface Insights {
  hardCount: number
  total: number
  longestGreenRun: number
  avgGap: string
  winRate: string
}

export function computeInsights(banner: Banner): Insights | null {
  const values = banner.data.map(d => d.value)
  if (!values.length) return null
  const chrono = [...values].reverse()
  const hardCount = values.filter(v => bandOf(v, banner) === 'red').length

  let longestGreenRun = 0
  let currentRun = 0
  chrono.forEach(v => {
    if (bandOf(v, banner) === 'green') {
      currentRun++
      longestGreenRun = Math.max(longestGreenRun, currentRun)
    } else currentRun = 0
  })

  const hardIdxs: number[] = []
  chrono.forEach((v, i) => {
    if (bandOf(v, banner) === 'red') hardIdxs.push(i)
  })
  let avgGap = '—'
  if (hardIdxs.length > 1) {
    const gaps: number[] = []
    for (let i = 1; i < hardIdxs.length; i++) gaps.push(hardIdxs[i] - hardIdxs[i - 1])
    avgGap = mean(gaps).toFixed(1)
  }

  let winRate = 'n/a'
  if (banner.has5050) {
    const decided = banner.data.filter(d => d.won === true || d.won === false)
    winRate = decided.length
      ? `${((decided.filter(d => d.won === true).length / decided.length) * 100).toFixed(0)}%`
      : '—'
  }

  return { hardCount, total: values.length, longestGreenRun, avgGap, winRate }
}

// avg pity vs maxPity/2 baseline → luck % (positive = lucky)
export function computeLuck(banner: Banner): { pct: number; avg: number; baseline: number } | null {
  const values = banner.data.map(d => d.value)
  if (!values.length) return null
  const baseline = banner.maxPity / 2
  const m = mean(values)
  return { pct: ((baseline - m) / baseline) * 100, avg: m, baseline }
}
