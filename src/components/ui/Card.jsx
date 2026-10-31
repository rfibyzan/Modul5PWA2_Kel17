const Card = ({ children, className = '', padded = true, ...props }) => {
  return (
    <div
      className={`
        bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm
        ${padded ? 'p-4 sm:p-6' : ''} ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`mb-4 ${className}`} {...props}>{children}</div>
)

const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-semibold text-gray-900 dark:text-gray-100 ${className}`} {...props}>
    {children}
  </h3>
)

const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`mt-1 text-sm text-gray-500 dark:text-gray-400 ${className}`} {...props}>
    {children}
  </p>
)

const CardContent = ({ children, className = '', ...props }) => (
  <div className={className} {...props}>{children}</div>
)

const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3 ${className}`} {...props}>
    {children}
  </div>
)

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }