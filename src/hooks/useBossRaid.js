import { useState, useEffect } from 'react'

/**
 * Checks whether there is an active Boss Raid for the current student's class.
 * Uses a simple one-shot fetch on mount; component can re-mount to re-check.
 */
export function useBossRaid() {
  const [raid, setRaid]     = useState(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    let mounted = true
    fetch('/api/siswa/boss-raid', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (mounted) {
          setRaid(data.raid || null)
          setChecked(true)
        }
      })
      .catch(() => {
        if (mounted) setChecked(true)
      })
    return () => { mounted = false }
  }, [])

  return { raid, checked }
}
