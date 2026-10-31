import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

// ---------------------------------------------------------------------------
// Cart Context — global cart state with localStorage persistence
// ---------------------------------------------------------------------------

const CartContext = createContext(null)

const CART_STORAGE_KEY = 'bore_barrel_cart'

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [isOpen, setIsOpen] = useState(false)

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
      if (typeof StorageEvent !== 'undefined') {
        window.dispatchEvent(new StorageEvent('storage', { key: CART_STORAGE_KEY }))
      }
    } catch (err) {
      console.warn('Failed to persist cart:', err)
    }
  }, [cartItems])

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === CART_STORAGE_KEY && e.newValue) {
        try {
          setCartItems(JSON.parse(e.newValue))
        } catch { /* ignore */ }
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const addItem = useCallback((gun, quantity = 1) => {
    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => item.id === gun.id)
      if (existingIdx >= 0) {
        const updated = [...prev]
        updated[existingIdx] = { ...updated[existingIdx], quantity: updated[existingIdx].quantity + quantity }
        return updated
      }
      return [...prev, { ...gun, quantity, addedAt: Date.now() }]
    })
  }, [])

  const removeItem = useCallback((gunId) => {
    setCartItems(prev => prev.filter(item => item.id !== gunId))
  }, [])

  const updateQuantity = useCallback((gunId, quantity) => {
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(item => item.id !== gunId))
      return
    }
    setCartItems(prev => prev.map(item => item.id === gunId ? { ...item, quantity } : item))
  }, [])

  const clearCart = useCallback(() => {
    setCartItems([])
  }, [])

  const toggleCart = useCallback(() => setIsOpen(prev => !prev), [])
  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const cartSummary = useMemo(() => ({
    itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: cartItems.reduce((sum, item) => sum + (item.price || item.cook_time || 0) * item.quantity, 0),
    uniqueItems: cartItems.length,
  }), [cartItems])

  return (
    <CartContext.Provider value={{
      cartItems,
      isOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      toggleCart,
      openCart,
      closeCart,
      ...cartSummary,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}