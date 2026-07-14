import type { Band, Banner } from './types'

export function bandOf(num: number, banner: Banner): Band {
  if (num >= banner.redFrom) return 'red'
  if (num >= banner.yellowFrom) return 'yellow'
  return 'green'
}

export function bandColorClass(band: Band): string {
  return band === 'red' ? 'band-red' : band === 'yellow' ? 'band-yellow' : 'band-green'
}

export function chartColor(band: Band): string {
  return band === 'red' ? '#ff5d6c' : band === 'yellow' ? '#f5b942' : '#34d399'
}
