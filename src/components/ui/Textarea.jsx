import { forwardRef } from 'react'

const Textarea = forwardRef(({
  label,
  error,
  helperText,
  className = '',
  rows = 3,
  id,
  ...props
}, ref) => {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')
  const errorId = error ? `${textareaId}-error` : undefined
  const helperId = helperText && !error ? `${textareaId}-helper` : undefined
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={`
          w-full px-4 py-2.5 rounded-lg border transition-colors duration-200 resize-y min-h-[80px]
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-gray-100
          placeholder:text-gray-400 dark:placeholder:text-gray-500
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600'
          }
          ${className}
        `}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={errorId || helperId}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'
export { Textarea }