import { Share2 } from 'lucide-react'
import { useShare } from '../../hooks/useShare'
import { Button } from '../ui'

/**
 * Share button for a gun product.
 * Uses Web Share API with clipboard fallback.
 */
export default function ShareButton({ gun, className = '', variant = 'ghost', size = 'icon' }) {
  const { share } = useShare()

  const handleClick = (e) => {
    e.stopPropagation()
    share(gun)
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      aria-label={`Bagikan ${gun.name}`}
      title="Bagikan"
    >
      <Share2 className="h-4 w-4" />
    </Button>
  )
}