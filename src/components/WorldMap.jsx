import React, { useState, useCallback, memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from "react-simple-maps";
import { geoCentroid } from "d3-geo";

// Use the provided GeoJSON URL
const geoUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const WorldMap = ({ visitedCountries = new Set() }) => {
  const [position, setPosition] = useState({
    coordinates: [0, 20],
    zoom: 1
  });
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [hoveredCountryName, setHoveredCountryName] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedCountry, setSelectedCountry] = useState(null);

  // Track mouse for tooltip
  const handleMouseMove = useCallback((evt) => {
    setMousePos({ x: evt.clientX, y: evt.clientY });
  }, []);

  // Hover handlers
  const handleMouseEnter = useCallback((countryCode, countryName) => {
    setHoveredCountry(countryCode);
    setHoveredCountryName(countryName);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredCountry(null);
    setHoveredCountryName(null);
  }, []);

  // Click handler: toggle selection and pan to country
  const handleCountryClick = useCallback(
    (countryCode, geo) => {
      setSelectedCountry((prev) =>
        prev === countryCode ? null : countryCode
      );
      // Pan and zoom to centroid on select, reset if deselected
      if (countryCode && prev !== countryCode) {
        const centroid = geoCentroid(geo);
        setPosition({
          coordinates: centroid,
          zoom: 2
        });
      } else {
        setPosition({ coordinates: [0, 20], zoom: 1 });
      }
    },
    []
  );

  const handleMoveEnd = useCallback((pos) => {
    setPosition(pos);
  }, []);

  return (
    <div
      className="w-full h-96 bg-blue-50 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative"
      onMouseMove={handleMouseMove}
      style={{ position: "relative" }}
    >
      {/* Tooltip */}
      {hoveredCountryName && (
        <div
          role="tooltip"
          aria-live="polite"
          className="pointer-events-none fixed z-50 px-3 py-1 rounded bg-black text-white text-xs shadow-lg"
          style={{
            left: mousePos.x + 16,
            top: mousePos.y - 22,
            transform: "translateY(-100%)",
            whiteSpace: "nowrap"
          }}
        >
          {hoveredCountryName}
        </div>
      )}

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 120, center: [0, 20] }}
        width={800}
        height={400}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          minZoom={0.5}
          maxZoom={8}
          onMoveEnd={handleMoveEnd}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryCode = geo.properties.ISO_A2;
                const countryName = geo.properties.NAME;
                const isVisited =
                  countryCode && visitedCountries.has(countryCode);
                const isHovered = hoveredCountry === countryCode;
                const isSelected = selectedCountry === countryCode;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    aria-label={countryName}
                    tabIndex={0}
                    onMouseEnter={() =>
                      handleMouseEnter(countryCode, countryName)
                    }
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleCountryClick(countryCode, geo)}
                    style={{
                      default: {
                        fill: isSelected
                          ? "#1e40af"
                          : isVisited
                          ? "#10b981"
                          : "#e5e7eb",
                        stroke: isSelected
                          ? "#1e3a8a"
                          : isHovered
                          ? "#3b82f6"
                          : "#d1d5db",
                        strokeWidth: isSelected ? 2 : isHovered ? 1.5 : 0.5,
                        outline: "none",
                        cursor: countryCode ? "pointer" : "default"
                      },
                      hover: {
                        fill: isSelected
                          ? "#1e40af"
                          : isVisited
                          ? "#059669"
                          : "#3b82f6",
                        stroke: "#1e3a8a",
                        strokeWidth: 2,
                        outline: "none",
                        cursor: countryCode ? "pointer" : "default"
                      },
                      pressed: {
                        fill: "#2563eb",
                        stroke: "#1e3a8a",
                        strokeWidth: 2,
                        outline: "none"
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

export default memo(WorldMap);
