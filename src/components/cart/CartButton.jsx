import { ShoppingCart } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { Button } from '../ui'

/**
 * Cart button with badge count for header.
 */
const CartButton = ({ onClick, className = '' }) => {
  const { itemCount, toggleCart } = useCart()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick || toggleCart}
      className={`relative ${className}`}
      aria-label={`Keranjang (${itemCount} item${itemCount !== 1 ? 's' : ''})`}
    >
      <ShoppingCart size={20} />
      {itemCount > 0 && (
        <span className="cart-badge">{itemCount}</span>
      )}
    </Button>
  )
}

export default CartButton