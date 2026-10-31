import { Share2 } from 'lucide-react'
import { useShare } from '../../hooks/useShare'

/**
 * Share button for a gun product.
 * Aligned with .card-act-btn circular button style from the module.
 */
export default function ShareButton({ gun, className = 'card-act-btn' }) {
  const { share } = useShare()

  const handleClick = (e) => {
    e.stopPropagation()
    share(gun)
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      aria-label={`Bagikan ${gun.name}`}
      title="Bagikan Tautan Unik"
    >
      <Share2 size={15} />
    </button>
  )
}
