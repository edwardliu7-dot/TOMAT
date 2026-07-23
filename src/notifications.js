import { useCallback, useEffect, useState } from 'react'

const base64ToUint8Array = value => {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(base64), char => char.charCodeAt(0))
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Terjadi kesalahan notifikasi.')
  return data
}

export function useAppNotifications(enabled = true) {
  const [state, setState] = useState({ notifications: [], unreadCount: 0, loading: true })
  const refresh = useCallback(async () => {
    if (!enabled) return
    try {
      const data = await api('/api/notifikasi')
      setState({ notifications: data.notifications || [], unreadCount: Number(data.unreadCount) || 0, loading: false })
    } catch {
      setState(previous => ({ ...previous, loading: false }))
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return undefined
    refresh()
    const timer = window.setInterval(refresh, 10000)
    return () => window.clearInterval(timer)
  }, [enabled, refresh])

  const markRead = useCallback(async id => {
    setState(previous => ({
      ...previous,
      unreadCount: Math.max(0, previous.unreadCount - (previous.notifications.find(item => item.id === id && !item.read_at) ? 1 : 0)),
      notifications: previous.notifications.map(item => item.id === id ? { ...item, read_at: item.read_at || new Date().toISOString() } : item),
    }))
    try { await api(`/api/notifikasi/${id}/read`, { method: 'POST' }) } catch { refresh() }
  }, [refresh])

  const markAllRead = useCallback(async () => {
    setState(previous => ({
      ...previous,
      unreadCount: 0,
      notifications: previous.notifications.map(item => ({ ...item, read_at: item.read_at || new Date().toISOString() })),
    }))
    try { await api('/api/notifikasi/read-all', { method: 'POST' }) } catch { refresh() }
  }, [refresh])

  return { ...state, refresh, markRead, markAllRead }
}

export function usePushNotifications(enabled = true) {
  const [state, setState] = useState({
    supported: false, configured: false, permission: 'default', subscribed: false, loading: true, error: '',
  })

  const syncSubscription = useCallback(async registration => {
    const subscription = await registration.pushManager.getSubscription()
    if (!subscription) {
      setState(previous => ({ ...previous, subscribed: false, loading: false }))
      return false
    }
    await api('/api/notifikasi/subscribe', { method: 'POST', body: subscription.toJSON() })
    setState(previous => ({ ...previous, subscribed: true, loading: false, error: '' }))
    return true
  }, [])

  useEffect(() => {
    let cancelled = false
    if (!enabled || typeof window === 'undefined') return undefined
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
    if (!supported) {
      setState(previous => ({ ...previous, supported: false, loading: false }))
      return undefined
    }
    setState(previous => ({ ...previous, supported: true, permission: Notification.permission }))
    ;(async () => {
      try {
        const config = await api('/api/notifikasi/config')
        if (cancelled) return
        if (!config.enabled) {
          setState(previous => ({ ...previous, configured: false, loading: false }))
          return
        }
        const registration = await navigator.serviceWorker.register('/sw.js')
        await syncSubscription(registration)
        setState(previous => ({ ...previous, configured: true, permission: Notification.permission }))
      } catch (error) {
        if (!cancelled) setState(previous => ({ ...previous, configured: true, loading: false, error: error.message }))
      }
    })()
    return () => { cancelled = true }
  }, [enabled, syncSubscription])

  const enable = useCallback(async () => {
    setState(previous => ({ ...previous, loading: true, error: '' }))
    try {
      if (!state.supported) throw new Error('Browser ini belum mendukung notifikasi perangkat.')
      if (!state.configured) throw new Error('Notifikasi perangkat belum dikonfigurasi server.')
      const permission = await Notification.requestPermission()
      setState(previous => ({ ...previous, permission }))
      if (permission !== 'granted') throw new Error('Izin notifikasi belum diberikan.')
      const registration = await navigator.serviceWorker.ready
      let subscription = await registration.pushManager.getSubscription()
      if (!subscription) {
        const config = await api('/api/notifikasi/config')
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64ToUint8Array(config.publicKey),
        })
      }
      await api('/api/notifikasi/subscribe', { method: 'POST', body: subscription.toJSON() })
      setState(previous => ({ ...previous, subscribed: true, loading: false, error: '' }))
    } catch (error) {
      setState(previous => ({ ...previous, loading: false, error: error.message }))
    }
  }, [state.configured, state.supported])

  const disable = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await api('/api/notifikasi/subscribe', { method: 'DELETE', body: { endpoint: subscription.endpoint } })
        await subscription.unsubscribe()
      }
      setState(previous => ({ ...previous, subscribed: false, error: '' }))
    } catch (error) {
      setState(previous => ({ ...previous, error: error.message }))
    }
  }, [])

  return { ...state, enable, disable }
}
