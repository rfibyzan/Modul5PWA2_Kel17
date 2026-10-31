const Badge = ({ children, variant = 'default', className = '', ...props }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    primary: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    info: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    draft: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    archive: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
  }
  
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${variants[variant]} ${className}
      `}
      {...props}
    >
      {children}
    </span>
  )
}

export { Badge }