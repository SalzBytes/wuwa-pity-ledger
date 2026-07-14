import { reactive } from 'vue'

export type ToastKind = 'info' | 'good' | 'warn'
export interface Toast {
  id: number
  msg: string
  kind: ToastKind
}

const toasts = reactive<Toast[]>([])
let seq = 0

export function useToast() {
  function showToast(msg: string, kind: ToastKind = 'info') {
    const id = ++seq
    toasts.push({ id, msg, kind })
    setTimeout(() => {
      const i = toasts.findIndex(t => t.id === id)
      if (i !== -1) toasts.splice(i, 1)
    }, 2400)
  }
  return { toasts, showToast }
}
