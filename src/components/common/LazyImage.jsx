import { useState, useRef, useEffect } from 'react'

const LazyImage = ({ 
  src, 
  alt = '', 
  className = '', 
  placeholder = 'blur',
  widths,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(() => {
    return typeof window !== 'undefined' && !('IntersectionObserver' in window)
  })
  const [hasError, setHasError] = useState(false)
  const containerRef = useRef(null)
  
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '120px', threshold: 0.01 }
    )
    
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }
    
    return () => observer.disconnect()
  }, [])
  
  const handleLoad = () => setIsLoaded(true)
  const handleError = () => { setHasError(true); setIsLoaded(true) }

  // Check if src is an external CDN image that supports width query params
  const isCdn = typeof src === 'string' && src.startsWith('http') && !src.endsWith('.svg')
  const srcSet = isCdn && Array.isArray(widths) ? widths.map(w => `${src}?w=${w} ${w}w`).join(', ') : undefined
  const sizes = srcSet ? '(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px' : undefined
  
  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`} aria-hidden={!isLoaded}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
      
      {placeholder === 'blur' && isCdn && !isLoaded && (
        <img
          src={`${src}?w=20&blur=30`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover scale-110 filter blur-md transition-all duration-700 ease-out"
          aria-hidden="true"
        />
      )}
      
      <img
        src={isInView ? src : undefined}
        srcSet={isInView ? srcSet : undefined}
        sizes={sizes}
        alt={alt}
        className={`
          w-full h-full object-cover transition-opacity duration-500 ease-out
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
          ${hasError ? 'hidden' : ''}
        `}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        {...props}
      />
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400">
          <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
    </div>
  )
}

export { LazyImage }
