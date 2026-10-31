import { useState, useEffect, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

const ToastContainer = ({ position = 'top-right' }) => {
  const [toasts, setToasts] = useState([])
  
  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random()
    const newToast = { id, ...toast }
    setToasts(prev => [...prev, newToast])
    return id
  }, [])
  
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])
  
  useEffect(() => {
    window.__TOAST__ = { addToast, removeToast }
    return () => {
      window.__TOAST__ = null
    }
  }, [addToast, removeToast])
  
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  }
  
  return (
    <div
      className={`
        fixed z-[100] flex flex-col gap-2 pointer-events-none
        ${positionClasses[position]}
      `}
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  )
}

const ToastItem = ({ toast, onClose }) => {
  const [visible, setVisible] = useState(true)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onClose(toast.id), 300)
    }, toast.duration || 4000)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onClose])
  
  if (!visible) return null
  
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
    default: <Info className="h-5 w-5 text-gray-500" />
  }
  
  const bgColors = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    default: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
  }
  
  return (
    <div
      className={`
        pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg min-w-[300px] max-w-md
        animate-slide-in ${bgColors[toast.type] || bgColors.default}
      `}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type] || icons.default}</div>
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="font-medium text-gray-900 dark:text-gray-100">{toast.title}</p>
        )}
        {toast.message && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onClose(toast.id), 300) }}
        className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Tutup"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// Global toast API
export const toast = {
  success: (title, message) => window.__TOAST__?.addToast({ type: 'success', title, message }),
  error: (title, message) => window.__TOAST__?.addToast({ type: 'error', title, message }),
  warning: (title, message) => window.__TOAST__?.addToast({ type: 'warning', title, message }),
  info: (title, message) => window.__TOAST__?.addToast({ type: 'info', title, message }),
  custom: (options) => window.__TOAST__?.addToast(options)
}

export { ToastContainer }