import { Plus, ShoppingCart } from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'
import { useCart } from '../context/CartContext'
import { Link } from 'react-router-dom'

function Header() {
  const { favorites } = useFavorites()
  const { itemCount } = useCart()
  const favCount = favorites ? favorites.length : 0

  return (
    <header className="header">
      <Link to="/catalog" className="header-brand-wrap" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
        <div className="header-logo-badge">
          <img src="/logo.png" alt="Bore & Barrel" />
        </div>
        <span className="brand display">Bore & Barrel</span>
      </Link>

      <nav className="nav">
        <Link to="/catalog" className="nav-link">Catalog</Link>
        <Link to="/favorites" className="nav-link">
          Favorites
          {favCount > 0 && <span className="nav-badge">{favCount}</span>}
        </Link>
        <Link to="/profile" className="nav-link">Profile</Link>
      </nav>

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link to="/cart" style={{ textDecoration: 'none' }}>
          <button
            type="button"
            className="icon-btn"
            style={{ position: 'relative' }}
            aria-label={`Keranjang (${itemCount} item${itemCount !== 1 ? 's' : ''})`}
            title="Keranjang Belanja"
          >
            <ShoppingCart size={18} />
            {itemCount > 0 && (
              <span className="cart-badge">{itemCount}</span>
            )}
          </button>
        </Link>

        <Link to="/create" style={{ textDecoration: 'none' }}>
          <button
            type="button"
            className="btn btn--primary btn--sm header-cta"
            title="Register new hardware"
          >
            <Plus size={15} /> Add Hardware
          </button>
        </Link>
      </div>
    </header>
  )
}

export default Header