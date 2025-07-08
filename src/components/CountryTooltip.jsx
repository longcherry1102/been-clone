import React from 'react'

const CountryTooltip = ({ country, position, isVisible }) => {
  if (!isVisible || !country) return null

  return (
    <div
      className="fixed z-50 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium pointer-events-none transform -translate-x-1/2 -translate-y-full"
      style={{
        left: position.x,
        top: position.y - 10,
      }}
    >
      <div className="flex items-center space-x-2">
        <span>{country.name}</span>
        {country.isVisited && (
          <span className="text-green-400 text-xs">✓ Visited</span>
        )}
      </div>
      <div className="text-xs text-gray-300">{country.continent}</div>
      
      {/* Tooltip arrow */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2">
        <div className="border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  )
}

export default CountryTooltip

