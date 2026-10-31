import { useState, useMemo } from 'react'

const Tabs = ({ defaultIndex = 0, selectedIndex, className = '', children, onChange, ...props }) => {
  const [internalIndex, setInternalIndex] = useState(defaultIndex)
  const activeIndex = selectedIndex !== undefined ? selectedIndex : internalIndex

  const tabs = useMemo(() => {
    const arr = Array.isArray(children) ? children : [children]
    return arr.filter(Boolean)
  }, [children])
  
  const handleTabClick = (index) => {
    setInternalIndex(index)
    onChange?.(index)
  }
  
  return (
    <div className={className} {...props} role="tablist">
      <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
        <nav className="flex gap-1 overflow-x-auto pb-px" role="tablist" aria-label="Tabs">
          {tabs.map((tab, index) => (
            <button
              key={index}
              role="tab"
              aria-selected={index === activeIndex}
              aria-controls={`tabpanel-${index}`}
              id={`tab-${index}`}
              onClick={() => handleTabClick(index)}
              className={`
                px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors duration-200
                whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${index === activeIndex
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-semibold'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border-b-2 border-transparent'
                }
              `}
            >
              {tab.props?.label || `Tab ${index + 1}`}
            </button>
          ))}
        </nav>
      </div>
      <div role="tabpanel" id={`tabpanel-${activeIndex}`} aria-labelledby={`tab-${activeIndex}`}>
        {tabs[activeIndex]?.props?.children}
      </div>
    </div>
  )
}

const TabItem = ({ label, children }) => {
  return <div>{children}</div>
}

TabItem.displayName = 'TabItem'

export { Tabs, TabItem }
