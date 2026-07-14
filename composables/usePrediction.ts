import type { Banner } from '~/utils/types'

export interface Prediction {
  value: number
  confidence: number // % of draws that landed on the modal value
  sampleOne: () => number
}

// Empirical bootstrap over a banner's own history.
// weightRecent applies geometric decay (recent pulls count more).
export function samplePrediction(banner: Banner, weightRecent: boolean): Prediction | null {
  const values = banner.data.map(d => d.value)
  if (!values.length) return null

  const decay = 0.94
  const weightMap: Record<number, number> = {}
  let totalWeight = 0
  values.forEach((v, idx) => {
    const w = weightRecent ? Math.pow(decay, idx) : 1
    weightMap[v] = (weightMap[v] || 0) + w
    totalWeight += w
  })

  const vals = Object.keys(weightMap).map(Number).sort((a, b) => a - b)
  const cumProbs: { value: number; cumProb: number }[] = []
  let cum = 0
  vals.forEach(v => {
    cum += weightMap[v] / totalWeight
    cumProbs.push({ value: v, cumProb: cum })
  })

  // Box–Muller standard normal
  function gauss(): number {
    const u = 1 - Math.random()
    const v = Math.random()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }

  // Resample a historical pity, then jitter it so sparse/single-value
  // histories still produce varied (but plausible) draws instead of a
  // constant. Spread scales with sample size — more data, tighter jitter.
  const spread = Math.max(2, banner.maxPity * 0.12 / Math.sqrt(values.length))
  function sampleOne(): number {
    const r = Math.random()
    let base = vals[vals.length - 1]
    for (const item of cumProbs) {
      if (r <= item.cumProb) { base = item.value; break }
    }
    const jittered = Math.round(base + gauss() * spread)
    return Math.min(banner.maxPity, Math.max(1, jittered))
  }


  const SIM = 10000
  const freq: Record<number, number> = {}
  for (let i = 0; i < SIM; i++) {
    const s = sampleOne()
    freq[s] = (freq[s] || 0) + 1
  }
  let best = vals[0]
  let bestCount = 0
  for (const [k, v] of Object.entries(freq)) {
    if (v > bestCount) {
      bestCount = v
      best = Number(k)
    }
  }

  return { value: best, confidence: (bestCount / SIM) * 100, sampleOne }
}
