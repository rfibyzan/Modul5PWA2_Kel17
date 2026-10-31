import FavoriteButton from '../common/FavoriteButton'
import ShareButton from './ShareButton'
import { LazyImage } from '../common/LazyImage'
import { formatPrice, truncate } from '../../utils/helpers'
import { useCart } from '../../context/CartContext'
import { toast } from '../ui'

/**
 * Product card used in the catalog grid.
 *
 * @param {Object}   props
 * @param {Object}   props.gun       — product data
 * @param {Function} props.onSelect  — called with the gun when clicked
 * @param {Function} [props.onEdit]  — called when Edit is clicked (admin)
 * @param {Function} [props.onArchive]— called when Archive is clicked (admin)
 * @param {Function} [props.onDelete]— called when Delete is clicked (admin)
 */
export default function GunCard({ gun, onSelect, onEdit, onArchive, onDelete }) {
  const { addItem } = useCart()
  const imgSrc = gun.image_url || gun.image || '/guns/pistol.svg'
  const category = gun.type || gun.category || '—'
  const caliber = gun.caliber || gun.difficulty || ''
  const price = gun.price ?? gun.cook_time ?? 0
  const isArchived = gun.deleted_at || gun.archived_at

  const handleAddToCart = (e) => {
    e.stopPropagation()
    addItem(gun)
    toast.success('Keranjang', `${gun.name} ditambahkan ke keranjang.`)
  }

  return (
    <li className="card">
      <button
        type="button"
        className="card-btn"
        onClick={() => onSelect(gun)}
        aria-label={`View ${gun.name}`}
      >
        <LazyImage
          src={imgSrc}
          alt={gun.name}
          className="card-img"
          width="240"
          height="180"
        />

        <span className="name display">{gun.name}</span>

        <span className="type">
          {category}
          {caliber ? ` · ${caliber}` : ''}
          {isArchived && <span className="badge badge--archive ml-2">Arsip</span>}
        </span>

        {gun.description && (
          <span className="card-desc">{truncate(gun.description, 72)}</span>
        )}

        <span className="price">{formatPrice(price)}</span>
      </button>

      {/* Floating actions row */}
      <div className="card-actions">
        <FavoriteButton gunId={gun.id || gun.name} />
        <ShareButton gun={gun} className="flex-1" />
        <button
          type="button"
          className="card-act-btn"
          onClick={handleAddToCart}
          aria-label={`Tambah ${gun.name} ke keranjang`}
          title="Tambah ke Keranjang"
        >
          🛒
        </button>

        {onEdit && (
          <button
            type="button"
            className="card-act-btn"
            onClick={(e) => { e.stopPropagation(); onEdit(gun) }}
            aria-label={`Edit ${gun.name}`}
            title="Edit"
          >
            ✏️
          </button>
        )}

        {onArchive && !isArchived && (
          <button
            type="button"
            className="card-act-btn"
            onClick={(e) => { e.stopPropagation(); onArchive(gun) }}
            aria-label={`Arsip ${gun.name}`}
            title="Arsip"
          >
            📦
          </button>
        )}

        {onArchive && isArchived && onArchive && (
          <button
            type="button"
            className="card-act-btn"
            onClick={(e) => { e.stopPropagation(); onArchive(gun) }}
            aria-label={`Pulihkan ${gun.name}`}
            title="Pulihkan"
          >
            ↩️
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            className="card-act-btn card-act-btn--danger"
            onClick={(e) => { e.stopPropagation(); onDelete(gun) }}
            aria-label={`Hapus ${gun.name}`}
            title="Hapus Permanen"
          >
            🗑️
          </button>
        )}
      </div>
    </li>
  )
}