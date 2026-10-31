import { useCart } from '../../context/CartContext'
import { formatPrice } from '../../utils/helpers'
import { Drawer } from '../ui'
import { Button } from '../ui'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { whatsappService } from '../../services/whatsappService'
import { toast } from '../ui'

/**
 * Cart drawer slide-in panel.
 */
const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, updateQuantity, removeItem, clearCart, totalPrice, itemCount } = useCart()
  const [checkingOut, setCheckingOut] = useState(false)

  const handleCheckout = () => {
    if (cartItems.length === 0) return
    setCheckingOut(true)
    
    // Use personal WhatsApp number - replace with actual number
    const phoneNumber = '6281234567890' // Replace with your WhatsApp number
    
    whatsappService.openCheckout(cartItems, phoneNumber)
    
    // Optional: Clear cart after checkout
    setTimeout(() => {
      clearCart()
      setCheckingOut(false)
      onClose()
      toast.success('Checkout!', 'Redirecting to WhatsApp…')
    }, 1000)
  }

  if (cartItems.length === 0) {
    return (
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title="Keranjang Belanja"
        position="right"
        size="md"
      >
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <h3>Keranjang Kosong</h3>
          <p>Tambahkan produk dari katalog untuk memulai belanja.</p>
          <Button variant="primary" onClick={onClose} className="mt-4">
            Lanjut Belanja
          </Button>
        </div>
      </Drawer>
    )
  }

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Keranjang Belanja"
      position="right"
      size="lg"
    >
      <div className="cart-drawer-content">
        <ul className="cart-items">
          {cartItems.map((item) => (
            <li key={item.id} className="cart-item">
              <img
                src={item.image_url || item.image || '/guns/pistol.svg'}
                alt={item.name}
                className="cart-item-img"
              />
              <div className="cart-item-details">
                <h4 className="cart-item-name">{item.name}</h4>
                <p className="cart-item-meta">
                  {item.type || '—'} · {item.caliber || '—'}
                </p>
                <p className="cart-item-price">Rp{formatPrice(item.price || item.cook_time || 0)}</p>
              </div>
              <div className="cart-item-controls">
                <div className="quantity-selector">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    aria-label="Kurangi"
                  >
                    −
                  </Button>
                  <span className="quantity-value">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    aria-label="Tambah"
                  >
                    +
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                  aria-label="Hapus item"
                  className="text-red-600"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </li>
          ))}
        </ul>

        <div className="cart-summary">
          <div className="summary-row">
            <span>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
            <span>Rp{formatPrice(totalPrice)}</span>
          </div>
          <div className="summary-row">
            <span>Estimasi Ongkir</span>
            <span>Gratis</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>Rp{formatPrice(totalPrice)}</span>
          </div>

          <Button
            variant="primary"
            className="w-full mt-4"
            onClick={handleCheckout}
            disabled={checkingOut}
          >
            {checkingOut ? (
              <>
                <span className="spin" style={{ width: 18, height: 18, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: 8 }} />
                Membuka WhatsApp…
              </>
            ) : (
              'Checkout via WhatsApp'
            )}
          </Button>

          <Button
            variant="ghost"
            className="w-full mt-2"
            onClick={() => { clearCart(); onClose(); }}
          >
            Kosongkan Keranjang
          </Button>
        </div>
      </div>
    </Drawer>
  )
}

export default CartDrawer