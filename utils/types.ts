export type Band = 'green' | 'yellow' | 'red'

export interface Pull {
  value: number
  won: boolean | null // 50/50 result; null when banner has no 50/50
}

export interface Banner {
  id: string
  name: string
  type: string
  maxPity: number
  yellowFrom: number
  redFrom: number
  has5050: boolean
  pullCost: number
  currentPity: number
  guaranteed: boolean
  data: Pull[] // data[0] = most recent
}

export interface LedgerState {
  activeBannerId: string
  weightRecent: boolean
  banners: Banner[]
}
