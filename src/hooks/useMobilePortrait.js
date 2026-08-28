import { useEffect, useState } from 'react'

const MOBILE_MAX_WIDTH = 1024

function detectMobilePortrait() {
  if (typeof window === 'undefined') return false
  return window.innerWidth < MOBILE_MAX_WIDTH && window.innerHeight >= window.innerWidth
}

/**
 * Detects the orientation gate used by the student experience.
 * A viewport below the desktop breakpoint is considered mobile; a square
 * viewport stays gated because it is not confirmed to be landscape yet.
 */
export default function useMobilePortrait() {
  const [isMobilePortrait, setIsMobilePortrait] = useState(detectMobilePortrait)

  useEffect(() => {
    const update = () => setIsMobilePortrait(detectMobilePortrait())
    const orientation = window.screen?.orientation

    update()
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    window.visualViewport?.addEventListener('resize', update)
    orientation?.addEventListener?.('change', update)

    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
      window.visualViewport?.removeEventListener('resize', update)
      orientation?.removeEventListener?.('change', update)
    }
  }, [])

  return isMobilePortrait
}