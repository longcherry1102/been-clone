import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Calendar, MapPin, Camera, Plus, Edit, Trash2, Clock, Tag } from 'lucide-react'

const MEMORY_TYPES = [
  { id: 'museum', label: 'Museum', color: 'bg-purple-100 text-purple-800' },
  { id: 'food', label: 'Food', color: 'bg-orange-100 text-orange-800' },
  { id: 'beach', label: 'Beach', color: 'bg-blue-100 text-blue-800' },
  { id: 'landmark', label: 'Landmark', color: 'bg-green-100 text-green-800' },
  { id: 'nature', label: 'Nature', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'entertainment', label: 'Entertainment', color: 'bg-pink-100 text-pink-800' },
  { id: 'shopping', label: 'Shopping', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'culture', label: 'Culture', color: 'bg-indigo-100 text-indigo-800' }
]

const TravelMemoryLog = ({ apiBaseUrl }) => {
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMemory, setEditingMemory] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    country: '',
    city: '',
    memory_type: '',
    visit_date: '',
    photo_url: ''
  })

  // Load memories from backend
  useEffect(() => {
    loadMemories()
  }, [])

  const loadMemories = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${apiBaseUrl}/travel-memories`)
      if (response.ok) {
        const data = await response.json()
        setMemories(data)
      } else {
        console.error('Failed to load memories')
      }
    } catch (error) {
      console.error('Error loading memories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const url = editingMemory 
        ? `${apiBaseUrl}/travel-memories/${editingMemory.id}`
        : `${apiBaseUrl}/travel-memories`
      
      const method = editingMemory ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await loadMemories()
        resetForm()
      } else {
        console.error('Failed to save memory')
      }
    } catch (error) {
      console.error('Error saving memory:', error)
    }
  }

  const handleDelete = async (memoryId) => {
    if (!confirm('Are you sure you want to delete this memory?')) {
      return
    }

    try {
      const response = await fetch(`${apiBaseUrl}/travel-memories/${memoryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadMemories()
      } else {
        console.error('Failed to delete memory')
      }
    } catch (error) {
      console.error('Error deleting memory:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      country: '',
      city: '',
      memory_type: '',
      visit_date: '',
      photo_url: ''
    })
    setShowAddForm(false)
    setEditingMemory(null)
  }

  const startEdit = (memory) => {
    setFormData({
      title: memory.title || '',
      description: memory.description || '',
      location: memory.location || '',
      country: memory.country || '',
      city: memory.city || '',
      memory_type: memory.memory_type || '',
      visit_date: memory.visit_date || '',
      photo_url: memory.photo_url || ''
    })
    setEditingMemory(memory)
    setShowAddForm(true)
  }

  const getMemoryTypeInfo = (type) => {
    return MEMORY_TYPES.find(t => t.id === type) || { label: type, color: 'bg-gray-100 text-gray-800' }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const groupMemoriesByDate = (memories) => {
    const grouped = {}
    memories.forEach(memory => {
      const date = memory.visit_date || 'No date'
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(memory)
    })
    return grouped
  }

  const groupedMemories = groupMemoriesByDate(memories)

  if (loading) {
    return (
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <Clock className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading your travel memories...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>Travel Memory Log</span>
            </CardTitle>
            <CardDescription>
              Capture and relive your travel experiences with photos, notes, and memories
            </CardDescription>
          </div>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Memory</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add/Edit Form */}
        {showAddForm && (
          <Card className="border-2 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-lg">
                {editingMemory ? 'Edit Memory' : 'Add New Memory'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      Title *
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., Amazing sunset at Santorini"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      Location *
                    </label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="e.g., Oia, Santorini"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      Country *
                    </label>
                    <Input
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                      placeholder="e.g., Greece"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      City
                    </label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="e.g., Santorini"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      Type
                    </label>
                    <select
                      value={formData.memory_type}
                      onChange={(e) => setFormData({...formData, memory_type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Select type...</option>
                      {MEMORY_TYPES.map(type => (
                        <option key={type.id} value={type.id}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      Visit Date
                    </label>
                    <Input
                      type="date"
                      value={formData.visit_date}
                      onChange={(e) => setFormData({...formData, visit_date: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Photo URL
                  </label>
                  <Input
                    value={formData.photo_url}
                    onChange={(e) => setFormData({...formData, photo_url: e.target.value})}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Share your experience, thoughts, and memories..."
                    rows={3}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit">
                    {editingMemory ? 'Update Memory' : 'Add Memory'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Timeline View */}
        <div className="space-y-6">
          <h3 className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>My Journey ({memories.length} memories)</span>
          </h3>

          {memories.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No memories yet
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start capturing your travel experiences by adding your first memory!
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Memory
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedMemories).map(([date, dateMemories]) => (
                <div key={date} className="relative">
                  {/* Date Header */}
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                      {formatDate(date)}
                    </div>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700 ml-4"></div>
                  </div>

                  {/* Memories for this date */}
                  <div className="space-y-4 ml-4">
                    {dateMemories.map((memory) => {
                      const typeInfo = getMemoryTypeInfo(memory.memory_type)
                      return (
                        <Card key={memory.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="font-medium text-gray-900 dark:text-white">
                                    {memory.title}
                                  </h4>
                                  {memory.memory_type && (
                                    <Badge className={typeInfo.color}>
                                      {typeInfo.label}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  <span className="flex items-center space-x-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{memory.location}</span>
                                  </span>
                                  <span>{memory.country}</span>
                                  {memory.city && <span>• {memory.city}</span>}
                                </div>
                                {memory.description && (
                                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                                    {memory.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex space-x-2 ml-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => startEdit(memory)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(memory.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            {memory.photo_url && (
                              <div className="mt-3">
                                <img
                                  src={memory.photo_url}
                                  alt={memory.title}
                                  className="w-full h-48 object-cover rounded-lg"
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                  }}
                                />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default TravelMemoryLog

