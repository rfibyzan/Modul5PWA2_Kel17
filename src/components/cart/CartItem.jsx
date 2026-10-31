/**
 * Cart item component (used within CartDrawer)
 */
const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <li className="cart-item">
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
      </div>
      <div className="cart-item-controls">
        <div className="quantity-selector">
          <button
            type="button"
            className="qty-btn"
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            aria-label="Kurangi"
          >
            −
          </button>
          <span className="quantity-value">{item.quantity}</span>
          <button
            type="button"
            className="qty-btn"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            aria-label="Tambah"
          >
            +
          </button>
        </div>
        <button
          type="button"
          className="remove-btn"
          onClick={() => onRemove(item.id)}
          aria-label="Hapus item"
        >
          🗑️
        </button>
      </div>
    </li>
  )
}

export default CartItem