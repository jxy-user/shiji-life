import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import type { StorageStatus } from '../../store/persistence'
import { useUIStore, type ToastTone } from '../../store/uiStore'
import { PaperButton, PaperSheet } from '../g/GPrimitives'
import styles from './Feedback.module.css'

interface ModalSheetProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
}

function trapDialogFocus(event: KeyboardEvent<HTMLDialogElement>) {
  if (event.key !== 'Tab') return
  const focusable = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter((element) => element.getClientRects().length > 0)
  const first = focusable[0]
  const last = focusable.at(-1)
  if (!first || !last) return
  if (event.shiftKey && (document.activeElement === first || !event.currentTarget.contains(document.activeElement))) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && (document.activeElement === last || !event.currentTarget.contains(document.activeElement))) {
    event.preventDefault()
    first.focus()
  }
}

export function ModalSheet({ open, onClose, title, description, children, footer }: ModalSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      previousFocusRef.current = document.activeElement as HTMLElement | null
      dialog.showModal()
    }
    if (!open && dialog.open) {
      dialog.close()
      const previous = previousFocusRef.current
      previousFocusRef.current = null
      previous?.focus()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onKeyDown={trapDialogFocus}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <PaperSheet className={styles.modal} as="div">
        <button className={styles.close} type="button" onClick={onClose} aria-label="关闭弹窗"><X size={22} /></button>
        <header className={styles.header}>
          <h2 id={titleId}>{title}</h2>
          {description && <p id={descriptionId}>{description}</p>}
        </header>
        {children && <div className={styles.body}>{children}</div>}
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </PaperSheet>
    </dialog>
  )
}

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = '确认' }: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => cancelRef.current?.focus(), 0)
    return () => window.clearTimeout(timer)
  }, [open])

  return (
    <ModalSheet
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <PaperButton ref={cancelRef} intent="secondary" onClick={onClose}>取消</PaperButton>
          <PaperButton
            intent="ink"
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >{confirmLabel}</PaperButton>
        </>
      }
    />
  )
}

const toastMarks: Record<ToastTone, string> = {
  success: '已记录',
  info: '已处理',
  warn: '需要注意',
}

export function ToastRegion() {
  const toast = useUIStore((state) => state.toast)
  const clearToast = useUIStore((state) => state.clearToast)

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(clearToast, 3600)
    return () => window.clearTimeout(timer)
  }, [toast, clearToast])

  if (!toast) return null
  const tone: ToastTone = toast.tone ?? 'success'
  return (
    <div
      className={[styles.toast, tone === 'info' ? styles.toastInfo : '', tone === 'warn' ? styles.toastWarn : ''].filter(Boolean).join(' ')}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {tone === 'warn' && <AlertTriangle size={18} aria-hidden="true" />}
      <span className={styles.toastMark} aria-hidden="true">{toastMarks[tone]}</span>
      {toast.message}
      <button type="button" onClick={clearToast} aria-label="关闭提示"><X size={18} /></button>
    </div>
  )
}

export function StorageNotice({ status, message }: { status: StorageStatus; message: string | null }) {
  if (status === 'ready') return null
  return (
    <div className={styles.storageNotice} role="alert">
      <AlertTriangle size={22} aria-hidden="true" />
      <div>
        <strong>{status === 'broken' ? '本地存档暂时无法读取' : '本地存档当前不可写'}</strong>
        <p>{message || '当前操作仍可继续，但刷新页面后可能不会保留。'}</p>
      </div>
      {status === 'broken' && <PaperButton size="small" intent="secondary" onClick={() => window.location.reload()}>重新载入</PaperButton>}
    </div>
  )
}
