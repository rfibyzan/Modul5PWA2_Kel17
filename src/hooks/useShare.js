import { useCallback } from 'react'
import { toast } from '../components/ui'

// ---------------------------------------------------------------------------
// useShare — Web Share API with clipboard fallback
// ---------------------------------------------------------------------------

export function useShare() {
  const share = useCallback(async (gun) => {
    const url = window.location.origin + `/gun/${gun.id}`
    const title = gun.name
    const text = `Check out ${gun.name} - ${gun.type || 'Firearm'} (${gun.caliber || 'Standard'}) - $${gun.price || gun.cook_time || 0}`

    const shareData = { title, text, url }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        toast.success('Berhasil Dibagikan', 'Tautan berhasil dibagikan')
      } else {
        throw new Error('Web Share API not supported')
      }
    } catch (err) {
      // Fallback to clipboard
      if (err.name === 'AbortError') return // User cancelled
      
      try {
        await navigator.clipboard.writeText(url)
        toast.success('Tautan Disalin!', 'Tautan unik hardware berhasil disalin ke clipboard')
      } catch {
        toast.error('Gagal Membagikan', 'Tidak dapat membagikan atau menyalin tautan')
      }
    }
  }, [])

  const copyLink = useCallback(async (url) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Tautan Disalin!', 'URL berhasil disalin ke clipboard')
      return true
    } catch {
      toast.error('Gagal Menyalin', 'Tidak dapat menyalin ke clipboard')
      return false
    }
  }, [])

  return { share, copyLink }
}

// ---------------------------------------------------------------------------
// shareUtils — URL building and deep link parsing
// ---------------------------------------------------------------------------

export const shareUtils = {
  /**
   * Build a shareable URL for a gun
   */
  buildGunUrl: (gunId) => {
    return `${window.location.origin}/gun/${gunId}`
  },

  /**
   * Build a deep link for PWA installed mode
   */
  buildDeepLink: (gunId) => {
    return `borebarrel://gun/${gunId}`
  },

  /**
   * Parse gun ID from current URL (for deep linking)
   */
  parseGunIdFromUrl: () => {
    const path = window.location.pathname
    const match = path.match(/\/gun\/([^/]+)/)
    return match ? match[1] : null
  },

  /**
   * Generate share text for a gun
   */
  generateShareText: (gun) => {
    const url = shareUtils.buildGunUrl(gun.id)
    return `Check out ${gun.name} - ${gun.type || 'Firearm'} (${gun.caliber || 'Standard'}) - $${gun.price || gun.cook_time || 0}\n${url}`
  },
}