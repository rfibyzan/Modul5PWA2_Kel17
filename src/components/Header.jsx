import { Plus, ShoppingCart } from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'
import { useCart } from '../context/CartContext'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui'

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
        <Link to="/cart" className="text-decoration-none">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={`Keranjang (${itemCount} item${itemCount !== 1 ? 's' : ''})`}
          >
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="cart-badge">{itemCount}</span>
            )}
          </Button>
        </Link>

        <Link to="/create">
          <Button variant="primary" size="sm" title="Register new hardware">
            <Plus size={15} /> Add Hardware
          </Button>
        </Link>
      </div>
    </header>
  )
}

export default Header