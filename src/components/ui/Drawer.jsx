import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

const Drawer = ({ 
  isOpen, 
  onClose, 
  children, 
  title, 
  position = 'right', 
  size = 'md',
  className = '',
  showClose = true
}) => {
  const overlayRef = useRef(null)
  const contentRef = useRef(null)
  
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])
  
  if (!isOpen) return null
  
  const positionClasses = {
    right: 'right-0 top-0 h-full',
    left: 'left-0 top-0 h-full',
    bottom: 'bottom-0 left-0 right-0'
  }
  
  const sizeClasses = {
    sm: 'w-64 sm:w-72',
    md: 'w-80 sm:w-96',
    lg: 'w-96 sm:w-[32rem]',
    xl: 'w-[36rem] sm:w-[40rem]',
    full: 'w-full'
  }
  
  const transformClasses = {
    right: 'translate-x-full',
    left: '-translate-x-full',
    bottom: 'translate-y-full'
  }
  
  const overlay = (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
      onClick={onClose}
      aria-hidden="true"
    />
  )
  
  const drawer = (
    <div
      ref={contentRef}
      className={`
        fixed z-50 flex flex-col bg-white dark:bg-gray-800 shadow-xl transition-transform duration-300 ease-in-out
        ${positionClasses[position]} ${sizeClasses[size]} ${transformClasses[position]}
        ${position === 'bottom' ? 'rounded-t-2xl' : 'rounded-l-2xl'}
        ${className}
      `}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'drawer-title' : undefined}
    >
      {(title || showClose) && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          {title && (
            <h2 id="drawer-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
          )}
          {showClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Tutup"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4">
        {children}
      </div>
    </div>
  )
  
  return createPortal([overlay, drawer], document.body)
}

export { Drawer }