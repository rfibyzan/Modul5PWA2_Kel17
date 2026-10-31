import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingBag, Trash2, Phone, ExternalLink } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/helpers'
import { Button, toast } from '../components/ui'
import { whatsappService } from '../services/whatsappService'

const SAVED_WA_KEY = 'bore_barrel_wa_number'

/**
 * Full-page Cart view with WhatsApp checkout
 */
export default function CartPage() {
  const navigate = useNavigate()
  const { cartItems, updateQuantity, removeItem, clearCart, totalPrice, itemCount } = useCart()
  const [phoneNumber, setPhoneNumber] = useState(() => {
    return localStorage.getItem(SAVED_WA_KEY) || '081234567890'
  })
  const [checkingOut, setCheckingOut] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_WA_KEY, phoneNumber)
    } catch {
      /* ignore */
    }
  }, [phoneNumber])

  const handleCheckout = () => {
    if (cartItems.length === 0) return
    setCheckingOut(true)

    whatsappService.openCheckout(cartItems, phoneNumber)

    setTimeout(() => {
      clearCart()
      setCheckingOut(false)
      toast.success('Pemesanan WhatsApp', 'Membuka WhatsApp untuk mengirim rincian pesanan…')
    }, 800)
  }

  return (
    <div className="form-page">
      {/* Header */}
      <div className="form-head">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate('/catalog')}
          className="detail-back"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={18} /> Kembali ke Katalog
        </Button>
      </div>

      <div className="form-title-group" style={{ marginBottom: '20px' }}>
        <h1 className="display">Keranjang Belanja</h1>
        <p className="lede">{itemCount} item dalam keranjang pemesanan</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="cart-empty-page" style={{ textAlign: 'center', padding: '48px 16px' }}>
          <ShoppingBag size={56} style={{ margin: '0 auto 16px', color: 'var(--steel, #888)' }} />
          <h2>Keranjang Kosong</h2>
          <p style={{ color: 'var(--steel, #888)', maxWidth: '400px', margin: '8px auto 20px' }}>
            Belum ada produk di keranjang. Jelajahi katalog armory dan tambahkan item pilihan Anda.
          </p>
          <Link to="/catalog">
            <Button variant="primary">
              Mulai Belanja
            </Button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          {/* Cart item list */}
          <ul className="cart-items-page" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cartItems.map((item) => {
              const itemPrice = Number(item.price ?? item.cook_time ?? 0)
              const subtotal = itemPrice * item.quantity

              return (
                <li
                  key={item.id}
                  className="cart-item-page"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    background: 'var(--card-bg, #fff)',
                    border: '1px solid var(--line, #eee)',
                    borderRadius: '8px',
                    flexWrap: 'wrap',
                  }}
                >
                  <img
                    src={item.image_url || item.image || '/guns/pistol.svg'}
                    alt={item.name}
                    style={{ width: '72px', height: '54px', objectFit: 'contain', background: '#f5f5f5', borderRadius: '6px', padding: '4px' }}
                  />

                  <div className="cart-item-details" style={{ flex: 1, minWidth: '180px' }}>
                    <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem' }}>{item.name}</h4>
                    <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: 'var(--steel, #888)' }}>
                      {item.type || item.category || 'Hardware'} {item.caliber ? `· ${item.caliber}` : ''}
                    </p>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{formatPrice(itemPrice)}</p>
                  </div>

                  <div className="cart-item-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--line, #ddd)', borderRadius: '6px' }}>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        style={{ padding: '6px 10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                        aria-label="Kurangi"
                      >
                        −
                      </button>
                      <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{ padding: '6px 10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                        aria-label="Tambah"
                      >
                        +
                      </button>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      aria-label="Hapus item"
                      title="Hapus item"
                      style={{ color: '#c0392b' }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  <div className="cart-item-subtotal" style={{ minWidth: '90px', textAlign: 'right', fontWeight: 'bold', fontSize: '1.05rem' }}>
                    {formatPrice(subtotal)}
                  </div>
                </li>
              )
            })}
          </ul>

          {/* Checkout & Summary Card */}
          <div
            className="cart-summary-page"
            style={{
              padding: '20px',
              background: 'var(--card-bg, #fff)',
              border: '1px solid var(--line, #eee)',
              borderRadius: '8px',
            }}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: '1.2rem' }}>Ringkasan Pesanan</h3>

            {/* WhatsApp Phone Number Configuration */}
            <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--paper, #f9f9f9)', borderRadius: '6px', border: '1px solid var(--line, #eee)' }}>
              <label htmlFor="wa-phone" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                <Phone size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                Nomor WhatsApp Tujuan (bisa nomor WA pribadi):
              </label>
              <input
                id="wa-phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Contoh: 081234567890"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--line, #ccc)',
                  fontFamily: 'monospace',
                  fontSize: '0.95rem',
                }}
              />
              <span style={{ display: 'block', fontSize: '0.75rem', color: '#888', marginTop: '4px' }}>
                Pesanan akan otomatis membuka chat WhatsApp ke nomor ini dengan pesan &quot;Hi aku mau pesan&quot;.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--steel, #666)' }}>
              <span>Total Item:</span>
              <span>{itemCount} unit</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '1.25rem', fontWeight: 'bold' }}>
              <span>Total Harga:</span>
              <span style={{ color: 'var(--brass, #b38f4d)' }}>{formatPrice(totalPrice)}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Button
                variant="primary"
                onClick={handleCheckout}
                disabled={checkingOut}
                style={{
                  padding: '12px',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#25D366',
                  color: '#fff',
                  border: 'none',
                }}
              >
                <ExternalLink size={18} /> Checkout via WhatsApp
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => { clearCart(); toast.success('Keranjang dikosongkan'); }}
              >
                Kosongkan Keranjang
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
