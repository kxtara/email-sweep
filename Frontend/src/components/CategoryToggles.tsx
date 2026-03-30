import { useState } from 'react'

export interface CategoryToggle {
  label: string
  default_on: boolean
  category: string
}

interface CategoryTogglesProps {
  categories: CategoryToggle[]
  onToggle: (label: string, isEnabled: boolean) => void
}

export function CategoryToggles({ categories, onToggle }: CategoryTogglesProps) {
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>(
    categories.reduce((acc, cat) => ({ ...acc, [cat.label]: cat.default_on }), {})
  )

  const handleToggle = (label: string) => {
    const newState = !toggleStates[label]
    setToggleStates((prev) => ({ ...prev, [label]: newState }))
    onToggle(label, newState)
  }

  return (
    <div className="mb-8 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-900">Exclude Categories</h2>
        <p className="text-sm text-gray-500">
          Select categories to protect them from deletion.
        </p>
      </div>
      
      {/* The Chip Container */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isActive = toggleStates[category.label];
          return (
            <button
              key={category.label}
              onClick={() => handleToggle(category.label)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                border focus:outline-none focus:ring-2 focus:ring-offset-1
                ${isActive 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md scale-105' 
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
                }
              `}
            >
              {isActive && <span className="mr-1.5">✓</span>}
              {category.label}
            </button>
          );
        })}
      </div>
    </div>
  )
}