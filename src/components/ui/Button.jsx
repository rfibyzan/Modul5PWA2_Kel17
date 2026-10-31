import { forwardRef } from 'react'

/**
 * Reusable Button component aligned with Bore & Barrel theme.
 * Matches classes defined in App.css from the module:
 * .btn, .btn--primary, .btn--outline, .btn--danger, .btn--sm, .icon-btn
 */
const Button = forwardRef(({
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  children,
  ...props
}, ref) => {
  const isIcon = size === 'icon'

  const variantClassMap = {
    primary: 'btn--primary',
    outline: 'btn--outline',
    secondary: 'btn--outline',
    danger: 'btn--danger',
    'danger-ghost': 'btn--danger-ghost',
    ghost: 'btn--outline',
  }

  const classes = []
  if (isIcon) {
    classes.push('icon-btn')
  } else {
    classes.push('btn')
    classes.push(variantClassMap[variant] || 'btn--primary')
    if (size === 'sm') classes.push('btn--sm')
  }

  if (className) classes.push(className)

  return (
    <button
      ref={ref}
      className={classes.join(' ')}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span
          className="spin"
          style={{
            width: 14,
            height: 14,
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
          }}
        />
      )}
      {children}
    </button>
  )
})

Button.displayName = 'Button'
export { Button }
