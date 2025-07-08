import React, { memo, useState } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps'

// World map topology URL
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

// Country code mapping for react-simple-maps
const countryCodeMap = {
  840: 'US', // United States
  124: 'CA', // Canada
  484: 'MX', // Mexico
  76: 'BR',  // Brazil
  32: 'AR',  // Argentina
  826: 'GB', // United Kingdom
  250: 'FR', // France
  276: 'DE', // Germany
  380: 'IT', // Italy
  724: 'ES', // Spain
  392: 'JP', // Japan
  156: 'CN', // China
  356: 'IN', // India
  764: 'TH', // Thailand
  36: 'AU',  // Australia
  554: 'NZ', // New Zealand
  710: 'ZA', // South Africa
  818: 'EG', // Egypt
  404: 'KE', // Kenya
  504: 'MA', // Morocco
}

const WorldMap = ({ visitedCountries, onCountryClick, hoveredCountry, setHoveredCountry }) => {
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 })

  const handleMoveEnd = (position) => {
    setPosition(position)
  }

  return (
    <div className="w-full h-96 bg-blue-50 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 120,
          center: [0, 20],
        }}
        width={800}
        height={400}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleMoveEnd}
          minZoom={0.5}
          maxZoom={8}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryCode = countryCodeMap[geo.id]
                const isVisited = countryCode && visitedCountries.has(countryCode)
                const isHovered = hoveredCountry === countryCode
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => {
                      if (countryCode) {
                        setHoveredCountry(countryCode)
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredCountry(null)
                    }}
                    onClick={() => {
                      if (countryCode && onCountryClick) {
                        onCountryClick(countryCode)
                      }
                    }}
                    style={{
                      default: {
                        fill: isVisited 
                          ? "#10b981" // Green for visited countries
                          : countryCode 
                            ? "#e5e7eb" // Light gray for trackable countries
                            : "#f3f4f6", // Very light gray for non-trackable countries
                        stroke: "#d1d5db",
                        strokeWidth: 0.5,
                        outline: "none",
                        cursor: countryCode ? "pointer" : "default",
                      },
                      hover: {
                        fill: isVisited 
                          ? "#059669" // Darker green for visited countries
                          : countryCode 
                            ? "#3b82f6" // Blue for trackable countries
                            : "#f3f4f6", // No change for non-trackable countries
                        stroke: "#374151",
                        strokeWidth: 1,
                        outline: "none",
                        cursor: countryCode ? "pointer" : "default",
                      },
                      pressed: {
                        fill: isVisited 
                          ? "#047857" // Even darker green
                          : countryCode 
                            ? "#2563eb" // Darker blue
                            : "#f3f4f6",
                        stroke: "#374151",
                        strokeWidth: 1,
                        outline: "none",
                      },
                    }}
                  />
                )
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-xs text-gray-600 dark:text-gray-300">Visited</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <span className="text-xs text-gray-600 dark:text-gray-300">Not Visited</span>
          </div>
        </div>
      </div>
      
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button
          onClick={() => setPosition(pos => ({ ...pos, zoom: Math.min(pos.zoom * 1.5, 8) }))}
          className="w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => setPosition(pos => ({ ...pos, zoom: Math.max(pos.zoom / 1.5, 0.5) }))}
          className="w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Zoom Out"
        >
          −
        </button>
        <button
          onClick={() => setPosition({ coordinates: [0, 0], zoom: 1 })}
          className="w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs"
          title="Reset View"
        >
          ⌂
        </button>
      </div>
    </div>
  )
}

export default memo(WorldMap)

