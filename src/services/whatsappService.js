// ---------------------------------------------------------------------------
// whatsappService — build WhatsApp checkout URLs with formatted messages
// ---------------------------------------------------------------------------

export const cleanPhoneNumber = (num) => {
  if (!num) return '6281234567890'
  let cleaned = String(num).replace(/[^0-9]/g, '')
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1)
  }
  if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned
  }
  return cleaned
}

export const whatsappService = {
  /**
   * Build a WhatsApp URL with pre-filled checkout message
   * @param {Array} cartItems - Array of { id, name, type, caliber, price, quantity, image_url }
   * @param {string} phoneNumber - WhatsApp number (e.g., '081234567890' or '6281234567890')
   * @returns {string} WhatsApp URL
   */
  buildCheckoutUrl: (cartItems, phoneNumber = '6281234567890') => {
    const formattedPhone = cleanPhoneNumber(phoneNumber)

    if (!cartItems || cartItems.length === 0) {
      return `https://wa.me/${formattedPhone}?text=${encodeURIComponent('Hi aku mau pesan tapi keranjang masih kosong.')}`
    }

    const lines = ['Hi aku mau pesan:']
    let total = 0

    cartItems.forEach((item, index) => {
      const price = Number(item.price ?? item.cook_time ?? 0)
      const qty = item.quantity || 1
      const subtotal = price * qty
      total += subtotal
      const type = item.type || item.category || ''
      const caliber = item.caliber || ''
      const spec = [type, caliber].filter(Boolean).join(' / ')
      lines.push(`${index + 1}. ${item.name}${spec ? ` (${spec})` : ''} - $${price.toLocaleString()} x ${qty} = $${subtotal.toLocaleString()}`)
    })

    lines.push('', `Total: $${total.toLocaleString()}`, '', 'Terima kasih!')

    const message = lines.join('\n')
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
  },

  /**
   * Open WhatsApp checkout in new tab
   */
  openCheckout: (cartItems, phoneNumber) => {
    const url = whatsappService.buildCheckoutUrl(cartItems, phoneNumber)
    window.open(url, '_blank', 'noopener,noreferrer')
  },
}

export default whatsappService
