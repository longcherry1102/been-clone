import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { MapPin, Navigation, Star, DollarSign, Clock, Camera, Heart, Coffee, Utensils, Mountain } from 'lucide-react'

// Mock places data for demonstration
const MOCK_PLACES = [
  {
    id: 1,
    name: "Central Park",
    type: "park",
    rating: 4.6,
    distance: 0.8,
    price: "$",
    mood: ["chill", "romantic"],
    description: "Iconic urban park perfect for relaxation and scenic walks",
    image: "🌳",
    coordinates: { lat: 40.7829, lng: -73.9654 }
  },
  {
    id: 2,
    name: "Metropolitan Museum of Art",
    type: "museum",
    rating: 4.7,
    distance: 1.2,
    price: "$$$",
    mood: ["explore", "cultural"],
    description: "World-renowned art museum with extensive collections",
    image: "🏛️",
    coordinates: { lat: 40.7794, lng: -73.9632 }
  },
  {
    id: 3,
    name: "Joe's Pizza",
    type: "restaurant",
    rating: 4.3,
    distance: 0.5,
    price: "$",
    mood: ["foodie", "cheap"],
    description: "Authentic New York style pizza slice",
    image: "🍕",
    coordinates: { lat: 40.7589, lng: -73.9851 }
  },
  {
    id: 4,
    name: "Brooklyn Bridge",
    type: "landmark",
    rating: 4.5,
    distance: 2.1,
    price: "Free",
    mood: ["explore", "romantic"],
    description: "Historic bridge with stunning city views",
    image: "🌉",
    coordinates: { lat: 40.7061, lng: -73.9969 }
  },
  {
    id: 5,
    name: "Blue Note Jazz Club",
    type: "entertainment",
    rating: 4.4,
    distance: 1.8,
    price: "$$",
    mood: ["romantic", "cultural"],
    description: "Legendary jazz club featuring world-class musicians",
    image: "🎷",
    coordinates: { lat: 40.7282, lng: -74.0021 }
  },
  {
    id: 6,
    name: "High Line Park",
    type: "park",
    rating: 4.6,
    distance: 1.5,
    price: "Free",
    mood: ["chill", "explore"],
    description: "Elevated park built on former railway tracks",
    image: "🚶",
    coordinates: { lat: 40.7480, lng: -74.0048 }
  }
]

const MOOD_OPTIONS = [
  { id: 'chill', label: 'Chill', icon: Coffee, color: 'bg-green-100 text-green-800' },
  { id: 'explore', label: 'Explore', icon: Mountain, color: 'bg-blue-100 text-blue-800' },
  { id: 'foodie', label: 'Foodie', icon: Utensils, color: 'bg-orange-100 text-orange-800' },
  { id: 'cheap', label: 'Cheap', icon: DollarSign, color: 'bg-yellow-100 text-yellow-800' },
  { id: 'romantic', label: 'Romantic', icon: Heart, color: 'bg-pink-100 text-pink-800' },
  { id: 'cultural', label: 'Cultural', icon: Camera, color: 'bg-purple-100 text-purple-800' }
]

const TravelDiscovery = ({ onAddToMemory }) => {
  const [currentLocation, setCurrentLocation] = useState(null)
  const [selectedMoods, setSelectedMoods] = useState([])
  const [maxDistance, setMaxDistance] = useState(5)
  const [maxPrice, setMaxPrice] = useState('$$$')
  const [filteredPlaces, setFilteredPlaces] = useState(MOCK_PLACES)
  const [locationStatus, setLocationStatus] = useState('idle') // idle, loading, success, error

  // Simulate getting current location
  const getCurrentLocation = () => {
    setLocationStatus('loading')
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setLocationStatus('success')
        },
        (error) => {
          console.error('Error getting location:', error)
          // Fallback to mock location (New York City)
          setCurrentLocation({ lat: 40.7589, lng: -73.9851 })
          setLocationStatus('success')
        }
      )
    } else {
      // Fallback to mock location
      setCurrentLocation({ lat: 40.7589, lng: -73.9851 })
      setLocationStatus('success')
    }
  }

  // Filter places based on selected criteria
  useEffect(() => {
    let filtered = MOCK_PLACES

    // Filter by mood
    if (selectedMoods.length > 0) {
      filtered = filtered.filter(place => 
        place.mood.some(mood => selectedMoods.includes(mood))
      )
    }

    // Filter by distance
    filtered = filtered.filter(place => place.distance <= maxDistance)

    // Filter by price
    const priceOrder = ['Free', '$', '$$', '$$$']
    const maxPriceIndex = priceOrder.indexOf(maxPrice)
    filtered = filtered.filter(place => {
      const placePriceIndex = priceOrder.indexOf(place.price)
      return placePriceIndex <= maxPriceIndex
    })

    setFilteredPlaces(filtered)
  }, [selectedMoods, maxDistance, maxPrice])

  const toggleMood = (moodId) => {
    setSelectedMoods(prev => 
      prev.includes(moodId) 
        ? prev.filter(id => id !== moodId)
        : [...prev, moodId]
    )
  }

  const getPriceDisplay = (price) => {
    if (price === 'Free') return 'Free'
    return price
  }

  const getRatingStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />)
    }

    return stars
  }

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Navigation className="h-5 w-5" />
          <span>Travel Discovery</span>
        </CardTitle>
        <CardDescription>
          Discover amazing places near you based on your mood and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location Detection */}
        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center space-x-3">
            <MapPin className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Current Location</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {locationStatus === 'success' && currentLocation
                  ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
                  : locationStatus === 'loading'
                  ? 'Getting your location...'
                  : 'Location not detected'
                }
              </p>
            </div>
          </div>
          <Button 
            onClick={getCurrentLocation}
            disabled={locationStatus === 'loading'}
            size="sm"
          >
            {locationStatus === 'loading' ? 'Locating...' : 'Get Location'}
          </Button>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-white">Filters</h3>
          
          {/* Mood Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Mood
            </label>
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map(mood => {
                const Icon = mood.icon
                const isSelected = selectedMoods.includes(mood.id)
                return (
                  <button
                    key={mood.id}
                    onClick={() => toggleMood(mood.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all ${
                      isSelected 
                        ? `${mood.color} border-current` 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{mood.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Distance Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Max Distance: {maxDistance} miles
            </label>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={maxDistance}
              onChange={(e) => setMaxDistance(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>

          {/* Price Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Max Price
            </label>
            <div className="flex space-x-2">
              {['Free', '$', '$$', '$$$'].map(price => (
                <button
                  key={price}
                  onClick={() => setMaxPrice(price)}
                  className={`px-3 py-2 rounded-lg border transition-all ${
                    maxPrice === price
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {price}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Places List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-white">
              Nearby Places ({filteredPlaces.length})
            </h3>
          </div>

          {filteredPlaces.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No places found matching your criteria. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPlaces.map(place => (
                <Card key={place.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{place.image}</span>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {place.name}
                          </h4>
                          <div className="flex items-center space-x-1">
                            {getRatingStars(place.rating)}
                            <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                              {place.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {place.type}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {place.description}
                    </p>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{place.distance} mi</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span>{getPriceDisplay(place.price)}</span>
                        </span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onAddToMemory && onAddToMemory(place)}
                        className="text-xs"
                      >
                        Add to Memory
                      </Button>
                    </div>

                    {/* Mood Tags */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {place.mood.map(mood => {
                        const moodOption = MOOD_OPTIONS.find(m => m.id === mood)
                        return (
                          <Badge
                            key={mood}
                            variant="outline"
                            className={`text-xs ${moodOption?.color || 'bg-gray-100 text-gray-800'}`}
                          >
                            {moodOption?.label || mood}
                          </Badge>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default TravelDiscovery

