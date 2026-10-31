const Skeleton = ({ className = '', variant = 'text', width, height, ...props }) => {
  const base = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded'
  
  const variants = {
    text: 'h-4 w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl border border-gray-200 dark:border-gray-700'
  }
  
  const style = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1rem' : undefined)
  }
  
  return (
    <div
      className={`${base} ${variants[variant]} ${className}`}
      style={style}
      {...props}
      aria-hidden="true"
    />
  )
}

const SkeletonCard = () => (
  <div className="animate-pulse">
    <Skeleton variant="rectangular" height="200" className="mb-4 rounded-xl" />
    <Skeleton variant="text" width="60%" className="mb-2" />
    <Skeleton variant="text" width="40%" className="mb-2" />
    <Skeleton variant="text" width="30%" />
  </div>
)

const SkeletonGunCard = () => (
  <div className="animate-pulse bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
    <Skeleton variant="rectangular" height="180" className="w-full" />
    <div className="p-4 space-y-3">
      <Skeleton variant="text" width="70%" />
      <Skeleton variant="text" width="50%" />
      <Skeleton variant="text" width="40%" />
      <div className="flex items-center gap-2 pt-2">
        <Skeleton variant="circular" width="32" height="32" />
        <Skeleton variant="circular" width="32" height="32" />
      </div>
    </div>
  </div>
)

export { Skeleton, SkeletonCard, SkeletonGunCard }