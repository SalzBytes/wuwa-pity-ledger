import { computed } from 'vue'
import { useLedger } from '~/composables/useLedger'

// 4★ now shares ONE pull stream with 5★ — no separate store. State lives on the
// active banner (persisted / exported by useLedger), so a convene advances both
// pities and logging a 5★ also breaks 4★ pity. This is just a thin facade over
// useLedger so the 4★ components keep their old shape.
//
// pity = pulls since last 4★ (0..HARD-1); history = pity each 4★ landed at.

export function useFourStar() {
  const { activeBanner, FOUR_HARD, star4, pull, undoPull, setPity4, log4Star, removeStar4 } = useLedger()

  const pity = computed(() => activeBanner.value.pity4 || 0)
  const history = star4 // derived 4★ landed-pity list from the unified stream

  return {
    pity,
    history,
    FOUR_HARD,
    pull,       // one convene (logs a 3★, auto-upgrades to 4★ at the guarantee)
    undoPull,   // remove the latest convene of any rarity
    setPity: setPity4,
    logHit: log4Star,
    removeAt: removeStar4
  }
}
