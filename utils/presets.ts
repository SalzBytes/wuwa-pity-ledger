export interface BannerPreset {
  label: string
  maxPity: number
  yellowFrom: number
  redFrom: number
  has5050: boolean
  pullCost: number
}

export const BANNER_PRESETS: Record<string, BannerPreset> = {
  character: { label: 'Character Event Convene', maxPity: 80, yellowFrom: 66, redFrom: 80, has5050: true, pullCost: 160 },
  weapon: { label: 'Weapon Event Convene', maxPity: 80, yellowFrom: 66, redFrom: 80, has5050: false, pullCost: 160 },
  standardChar: { label: 'Standard Character Convene', maxPity: 80, yellowFrom: 66, redFrom: 80, has5050: false, pullCost: 160 },
  standardWeapon: { label: 'Standard Weapon Convene', maxPity: 80, yellowFrom: 66, redFrom: 80, has5050: false, pullCost: 160 },
  novice: { label: 'Novice Convene', maxPity: 50, yellowFrom: 40, redFrom: 50, has5050: false, pullCost: 160 },
  custom: { label: 'Custom', maxPity: 80, yellowFrom: 60, redFrom: 80, has5050: false, pullCost: 160 }
}

export const DEFAULT_PULLS = [
  { value: 71, won: true }, { value: 69, won: false }, { value: 3, won: true }, { value: 73, won: true },
  { value: 70, won: false }, { value: 59, won: true }, { value: 32, won: true }, { value: 73, won: false },
  { value: 22, won: true }, { value: 9, won: true }, { value: 67, won: true }, { value: 67, won: false },
  { value: 73, won: true }, { value: 22, won: true }, { value: 13, won: true }, { value: 9, won: false },
  { value: 67, won: true }, { value: 72, won: true }, { value: 35, won: true }, { value: 67, won: false },
  { value: 71, won: true }, { value: 70, won: true }, { value: 22, won: false }, { value: 66, won: true },
  { value: 9, won: true }, { value: 25, won: true }, { value: 45, won: false }, { value: 44, won: true },
  { value: 71, won: true }
]

export function uid(): string {
  return Math.random().toString(36).slice(2, 9)
}
