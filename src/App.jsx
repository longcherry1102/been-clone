import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Globe, MapPin, Search, Share2, Calendar, Percent, Map } from 'lucide-react'
import WorldMap from './components/WorldMap.jsx'
import CountryTooltip from './components/CountryTooltip.jsx'
import TravelDiscovery from './components/TravelDiscovery.jsx'
import TravelMemoryLog from './components/TravelMemoryLog.jsx'
import './App.css'

// Sample country data - in a real app this would come from an API
const COUNTRIES = [
  { code: 'US', name: 'United States', continent: 'North America' },
  { code: 'CA', name: 'Canada', continent: 'North America' },
  { code: 'MX', name: 'Mexico', continent: 'North America' },
  { code: 'BR', name: 'Brazil', continent: 'South America' },
  { code: 'AR', name: 'Argentina', continent: 'South America' },
  { code: 'GB', name: 'United Kingdom', continent: 'Europe' },
  { code: 'FR', name: 'France', continent: 'Europe' },
  { code: 'DE', name: 'Germany', continent: 'Europe' },
  { code: 'IT', name: 'Italy', continent: 'Europe' },
  { code: 'ES', name: 'Spain', continent: 'Europe' },
  { code: 'JP', name: 'Japan', continent: 'Asia' },
  { code: 'CN', name: 'China', continent: 'Asia' },
  { code: 'IN', name: 'India', continent: 'Asia' },
  { code: 'TH', name: 'Thailand', continent: 'Asia' },
  { code: 'AU', name: 'Australia', continent: 'Oceania' },
  { code: 'NZ', name: 'New Zealand', continent: 'Oceania' },
  { code: 'ZA', name: 'South Africa', continent: 'Africa' },
  { code: 'EG', name: 'Egypt', continent: 'Africa' },
  { code: 'KE', name: 'Kenya', continent: 'Africa' },
  { code: 'MA', name: 'Morocco', continent: 'Africa' },
]

const API_BASE_URL = '/api'

function App() {
  const [visitedCountries, setVisitedCountries] = useState(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedContinent, setSelectedContinent] = useState('All')
  const [stats, setStats] = useState({
    total_countries: 0,
    total_continents: 0,
    world_coverage: 0
  })
  const [loading, setLoading] = useState(true)
  const [hoveredCountry, setHoveredCountry] = useState(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const continents = ['All', ...new Set(COUNTRIES.map(c => c.continent))]

  // Track mouse position for tooltip
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Load visited countries from backend on component mount
  useEffect(() => {
    loadVisitedCountries()
  }, [])

  const loadVisitedCountries = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/visited-countries`)
      const data = await response.json()
      
      const visitedCodes = new Set(data.visited_countries.map(c => c.country_code))
      setVisitedCountries(visitedCodes)
      
      // Load stats
      const statsResponse = await fetch(`${API_BASE_URL}/visited-countries/stats`)
      const statsData = await statsResponse.json()
      setStats(statsData)
      
      setLoading(false)
    } catch (error) {
      console.error('Error loading visited countries:', error)
      setLoading(false)
    }
  }

  const filteredCountries = COUNTRIES.filter(country => {
    const matchesSearch = country.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesContinent = selectedContinent === 'All' || country.continent === selectedContinent
    return matchesSearch && matchesContinent
  })

  const toggleCountry = async (countryCode) => {
    const country = COUNTRIES.find(c => c.code === countryCode)
    if (!country) return

    try {
      if (visitedCountries.has(countryCode)) {
        // Remove country
        const response = await fetch(`${API_BASE_URL}/visited-countries/${countryCode}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          const newVisited = new Set(visitedCountries)
          newVisited.delete(countryCode)
          setVisitedCountries(newVisited)
          
          // Update stats
          loadVisitedCountries()
        }
      } else {
        // Add country
        const response = await fetch(`${API_BASE_URL}/visited-countries`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            country_code: countryCode,
            country_name: country.name,
            continent: country.continent
          })
        })
        
        if (response.ok) {
          const newVisited = new Set(visitedCountries)
          newVisited.add(countryCode)
          setVisitedCountries(newVisited)
          
          // Update stats
          loadVisitedCountries()
        }
      }
    } catch (error) {
      console.error('Error updating country:', error)
    }
  }

  const shareProgress = () => {
    const visitedList = COUNTRIES
      .filter(c => visitedCountries.has(c.code))
      .map(c => c.name)
      .join(', ')
    
    const shareText = `I've visited ${stats.total_countries} countries (${stats.world_coverage}% of the world)! ${visitedList}`
    
    if (navigator.share) {
      navigator.share({
        title: 'My Travel Progress',
        text: shareText,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(shareText)
      alert('Travel progress copied to clipboard!')
    }
  }

  const handleAddToMemory = async (place) => {
    try {
      const memoryData = {
        title: place.name,
        description: place.description,
        location: place.name,
        country: 'United States', // Default for mock data
        city: 'New York', // Default for mock data
        memory_type: place.type,
        visit_date: new Date().toISOString().split('T')[0] // Today's date
      }

      const response = await fetch(`${API_BASE_URL}/travel-memories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memoryData)
      })

      if (response.ok) {
        alert(`Added "${place.name}" to your travel memories!`)
      } else {
        console.error('Failed to add memory')
        alert('Failed to add memory. Please try again.')
      }
    } catch (error) {
      console.error('Error adding memory:', error)
      alert('Error adding memory. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Globe className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading your travel data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Globe className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Been</h1>
            </div>
            <Button onClick={shareProgress} variant="outline" className="flex items-center space-x-2">
              <Share2 className="h-4 w-4" />
              <span>Share Progress</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Countries Visited</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_countries}</div>
              <p className="text-xs text-muted-foreground">
                out of {COUNTRIES.length} countries
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">World Coverage</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.world_coverage}%</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.world_coverage}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Continents</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_continents}</div>
              <p className="text-xs text-muted-foreground">
                out of {continents.length - 1} continents
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Interactive World Map */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Map className="h-5 w-5" />
              <span>Interactive World Map</span>
            </CardTitle>
            <CardDescription>
              Click on countries to mark them as visited. Hover to see country details.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <WorldMap
              visitedCountries={visitedCountries}
              onCountryClick={toggleCountry}
              hoveredCountry={hoveredCountry}
              setHoveredCountry={setHoveredCountry}
            />
          </CardContent>
        </Card>

        {/* Travel Discovery */}
        <div className="mb-8">
          <TravelDiscovery onAddToMemory={handleAddToMemory} />
        </div>

        {/* Search and Filter */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle>Track Your Travels</CardTitle>
            <CardDescription>
              Search and mark the countries you've visited to build your travel map
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {continents.map(continent => (
                  <Button
                    key={continent}
                    variant={selectedContinent === continent ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedContinent(continent)}
                  >
                    {continent}
                  </Button>
                ))}
              </div>
            </div>

            {/* Countries Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredCountries.map(country => (
                <div
                  key={country.code}
                  onClick={() => toggleCountry(country.code)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    visitedCountries.has(country.code)
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{country.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{country.continent}</p>
                    </div>
                    {visitedCountries.has(country.code) && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        ✓ Visited
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredCountries.length === 0 && (
              <div className="text-center py-12">
                <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No countries found matching your search.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visited Countries Summary */}
        {visitedCountries.size > 0 && (
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Your Travel Journey</CardTitle>
              <CardDescription>
                Countries you've visited so far
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {COUNTRIES
                  .filter(country => visitedCountries.has(country.code))
                  .map(country => (
                    <Badge
                      key={country.code}
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {country.name}
                    </Badge>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Travel Memory Log */}
        <div className="mb-8">
          <TravelMemoryLog apiBaseUrl={API_BASE_URL} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Track your travels and discover the world, one country at a time.
            </p>
          </div>
        </div>
      </footer>

      {/* Country Tooltip */}
      <CountryTooltip
        country={hoveredCountry ? {
          name: COUNTRIES.find(c => c.code === hoveredCountry)?.name || '',
          continent: COUNTRIES.find(c => c.code === hoveredCountry)?.continent || '',
          isVisited: visitedCountries.has(hoveredCountry)
        } : null}
        position={mousePosition}
        isVisible={!!hoveredCountry}
      />
    </div>
  )
}

export default App

