import { useEffect, useRef } from 'react'

/**
 * useTaskGuard — Anti-cheat guard for active task sessions.
 *
 * When a student switches tabs, backgrounds the app (Android), or navigates
 * away while a task session is active:
 *   1. Reports the exit to the server → guru receives an in-app notification.
 *   2. Resets the task progress to zero so questions restart from the beginning.
 *
 * A 600 ms debounce prevents false positives from transient browser focus
 * events (e.g. a file-picker dialog, the address bar, permission prompts).
 *
 * Usage: call inside a component that has access to TaskContext.
 *   useTaskGuard({ activeSession, resetTaskSession })
 */
export function useTaskGuard({ activeSession, resetTaskSession }) {
  const sessionRef = useRef(activeSession)
  useEffect(() => { sessionRef.current = activeSession }, [activeSession])

  const resetRef = useRef(resetTaskSession)
  useEffect(() => { resetRef.current = resetTaskSession }, [resetTaskSession])

  useEffect(() => {
    if (!activeSession) return   // guard is only active during a task session

    const sessionStart = Date.now()
    const GRACE_MS    = 2000    // ignore events in the first 2 s (page transitions)
    const DEBOUNCE_MS = 600     // wait before confirming the hide is real

    let triggered    = false
    let debounceTimer = null
    let capListener  = null

    async function onConfirmedHide() {
      if (triggered) return
      const session = sessionRef.current
      if (!session) return
      triggered = true

      // ── 1. Report to server (fire-and-forget, survive offline) ──────────
      try {
        await fetch('/api/siswa/tugas/laporan-keluar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            tugasId:        session.taskId,
            correctAtExit:  session.correctAnswers,
            totalQuestions: session.totalQuestions,
          }),
          keepalive: true,    // survives page unload
        })
      } catch { /* network offline — swallow */ }

      // ── 2. Reset task progress ───────────────────────────────────────────
      resetRef.current?.()
    }

    // ── visibilitychange (browser tab switch / screen lock) ─────────────
    function onVisibilityChange() {
      if (Date.now() - sessionStart < GRACE_MS) return
      if (document.visibilityState === 'hidden') {
        debounceTimer = setTimeout(onConfirmedHide, DEBOUNCE_MS)
      } else {
        clearTimeout(debounceTimer)
        debounceTimer = null
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    // ── Capacitor Android: app sent to background ────────────────────────
    if (window.Capacitor?.Plugins?.App) {
      window.Capacitor.Plugins.App.addListener('appStateChange', ({ isActive }) => {
        if (Date.now() - sessionStart < GRACE_MS) return
        if (!isActive) {
          debounceTimer = setTimeout(onConfirmedHide, DEBOUNCE_MS)
        } else {
          clearTimeout(debounceTimer)
          debounceTimer = null
        }
      }).then(handle => { capListener = handle })
    }

    // ── beforeunload: browser native warning when closing/navigating ─────
    function onBeforeUnload(e) {
      if (!sessionRef.current) return
      e.preventDefault()
      // Modern browsers show their own generic message; returnValue text is ignored
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)

    return () => {
      clearTimeout(debounceTimer)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('beforeunload', onBeforeUnload)
      capListener?.remove?.()
    }
  }, [activeSession])   // re-bind whenever a new session starts or session ends
}
