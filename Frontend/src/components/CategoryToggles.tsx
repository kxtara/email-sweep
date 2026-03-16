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
    <div className="mb-12 bg-white rounded-xl border border-gray-200 p-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        Exclude Categories
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        These categories will be protected from deletion
      </p>
      
      <div className="space-y-4">
        {categories.map((category) => (
          <label key={category.label} className="flex items-center cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={toggleStates[category.label]}
                onChange={() => handleToggle(category.label)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 accent-blue-600 cursor-pointer"
              />
            </div>
            <span className="ml-4 text-gray-900 font-medium group-hover:text-blue-600 transition-colors">
              {category.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
