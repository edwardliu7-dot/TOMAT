import { useState, useEffect } from 'react'

/**
 * Returns true when the device is mobile (width < 1024px) AND in landscape
 * orientation (width > height, min 620px wide).
 * Mirrors the isLandscapeHome logic in AppShell.jsx.
 */
export function useLandscapeMobile() {
  const [isLandscape, setIsLandscape] = useState(() => {
    if (typeof window === 'undefined') return false
    return (
      window.innerWidth > window.innerHeight &&
      window.innerWidth >= 620 &&
      window.innerWidth < 1024
    )
  })

  useEffect(() => {
    const update = () => {
      setIsLandscape(
        window.innerWidth > window.innerHeight &&
        window.innerWidth >= 620 &&
        window.innerWidth < 1024
      )
    }
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  return isLandscape
}
