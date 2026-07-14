export type Band = 'green' | 'yellow' | 'red'

export type Rarity = 3 | 4 | 5

// One convene. `value` = the 5★ pity position at which it happened (1..maxPity),
// so 5★ rows use it directly and 3★/4★ rows sit in the ordered stream too.
// `p4` = the 4★ pity position (1..10) of this convene. `won` = 50/50 result on
// a 5★ (null otherwise).
export interface Pull {
  value: number
  won: boolean | null // 50/50 result; null when banner has no 50/50 (or non-5★)
  rarity?: Rarity // undefined = legacy 5★ record (migrated on load)
  p4?: number // 4★ pity position at this convene (1..10)
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
  data: Pull[] // data[0] = most recent (5★ pulls)
  // 4★ shares the same pull stream as 5★: every convene advances both pities,
  // and logging a 5★ also resets the 4★ counter. Kept on the banner so it
  // persists / exports / scopes per-banner alongside the 5★ ledger.
  pity4?: number // pulls since last 4★ (0..9)
  star4?: number[] // pity each logged 4★ landed at, newest-first (1..10)
}


export interface LedgerState {
  activeBannerId: string
  weightRecent: boolean
  banners: Banner[]
}
