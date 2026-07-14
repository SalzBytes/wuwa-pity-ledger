import type { LedgerState } from '~/utils/types'

// Full history round-trips inside the exported state (banners[].data).
export function useImportExport() {
  function exportData(state: LedgerState) {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pity-ledger-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // resolves parsed state or rejects if the file isn't a valid export
  function importData(file: File): Promise<LedgerState> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result))
          if (!parsed || !Array.isArray(parsed.banners) || !parsed.banners.length) {
            throw new Error('bad shape')
          }
          resolve(parsed as LedgerState)
        } catch {
          reject(new Error('invalid'))
        }
      }
      reader.onerror = () => reject(new Error('read error'))
      reader.readAsText(file)
    })
  }

  return { exportData, importData }
}
