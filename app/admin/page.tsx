"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Edit2, ChevronDown, ChevronUp } from "lucide-react"

interface Channel {
  id: string
  name: string
  slug: string
  sources: string[]
  imageUrl?: string
}

interface Match {
  id: string
  name: string
  slug: string
  sources: string[]
  imageUrl?: string
  expiresAt: string
}

export default function AdminPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  
  const [showChannelPopup, setShowChannelPopup] = useState(false)
  const [popupMounted, setPopupMounted] = useState(false)
  const [channels, setChannels] = useState<Channel[]>([])
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null)
  const [channelName, setChannelName] = useState("")
  const [channelSources, setChannelSources] = useState<string[]>([""])
  const [channelImageUrl, setChannelImageUrl] = useState("")
  
  const [showMatchPopup, setShowMatchPopup] = useState(false)
  const [matchPopupMounted, setMatchPopupMounted] = useState(false)
  const [matches, setMatches] = useState<Match[]>([])
  const [editingMatch, setEditingMatch] = useState<Match | null>(null)
  const [matchName, setMatchName] = useState("")
  const [matchSources, setMatchSources] = useState<string[]>([""])
  const [matchImageUrl, setMatchImageUrl] = useState("")
  const [matchExpiresAt, setMatchExpiresAt] = useState("")
  
  const [isSaving, setIsSaving] = useState(false)
  const [showDeletePopup, setShowDeletePopup] = useState(false)
  const [deletePopupMounted, setDeletePopupMounted] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ id: string, name: string, type: 'channel' | 'match' } | null>(null)
  
  const [channelsExpanded, setChannelsExpanded] = useState(false)
  const [matchesExpanded, setMatchesExpanded] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check')
        const data = await response.json()
        setIsLoggedIn(data.authenticated)
        
        if (data.authenticated) {
          fetchChannels()
          fetchMatches()
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [])

  useEffect(() => {
    setMounted(false)
    const timer = setTimeout(() => {
      setMounted(true)
    }, 150)
    return () => clearTimeout(timer)
  }, [isLoggedIn])

  const fetchChannels = async () => {
    try {
      const response = await fetch('/api/admin/channels')
      const data = await response.json()
      if (data.channels) {
        const sortedChannels = data.channels.sort((a: Channel, b: Channel) => 
          a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
        )
        setChannels(sortedChannels)
      }
    } catch (error) {
      console.error('Error fetching channels:', error)
    }
  }

  const fetchMatches = async () => {
    try {
      await fetch('/api/admin/update-release', { method: 'POST' })
      
      const response = await fetch('/api/admin/matches')
      const data = await response.json()
      if (data.matches) {
        const sortedMatches = data.matches.sort((a: Match, b: Match) => 
          a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
        )
        setMatches(sortedMatches)
      }
    } catch (error) {
      console.error('Error fetching matches:', error)
    }
  }

  const handleAddChannel = () => {
    setEditingChannel(null)
    setChannelName("")
    setChannelSources([""])
    setChannelImageUrl("")
    setShowChannelPopup(true)
    setTimeout(() => {
      setPopupMounted(true)
    }, 50)
  }

  const handleEditChannel = (channel: Channel) => {
    setEditingChannel(channel)
    setChannelName(channel.name)
    setChannelSources(channel.sources)
    setChannelImageUrl(channel.imageUrl || "")
    setShowChannelPopup(true)
    setTimeout(() => {
      setPopupMounted(true)
    }, 50)
  }

  const handleAddMatch = () => {
    setEditingMatch(null)
    setMatchName("")
    setMatchSources([""])
    setMatchImageUrl("")
    
    const now = new Date()
    now.setHours(now.getHours() + 2)
    const defaultExpires = now.toISOString().slice(0, 16)
    setMatchExpiresAt(defaultExpires)
    
    setShowMatchPopup(true)
    setTimeout(() => {
      setMatchPopupMounted(true)
    }, 50)
  }

  const handleEditMatch = (match: Match) => {
    setEditingMatch(match)
    setMatchName(match.name)
    setMatchSources(match.sources)
    setMatchImageUrl(match.imageUrl || "")
    setMatchExpiresAt(match.expiresAt)
    setShowMatchPopup(true)
    setTimeout(() => {
      setMatchPopupMounted(true)
    }, 50)
  }

  const handleDeleteItem = async (id: string, name: string, type: 'channel' | 'match') => {
    setItemToDelete({ id, name, type })
    setShowDeletePopup(true)
    setTimeout(() => {
      setDeletePopupMounted(true)
    }, 50)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    try {
      const endpoint = itemToDelete.type === 'channel' ? '/api/admin/channels' : '/api/admin/matches'
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemToDelete.id }),
      })

      const data = await response.json()

      if (data.success) {
        if (itemToDelete.type === 'channel') {
          fetchChannels()
        } else {
          fetchMatches()
        }
        setNotificationMessage(`${itemToDelete.type === 'channel' ? 'Channel' : 'Match'} deleted`)
        setShowNotification(true)
      } else {
        setNotificationMessage('Error deleting item')
        setShowNotification(true)
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      setNotificationMessage('Server connection error')
      setShowNotification(true)
    } finally {
      setDeletePopupMounted(false)
      setTimeout(() => {
        setShowDeletePopup(false)
        setItemToDelete(null)
      }, 300)
    }
  }

  const cancelDelete = () => {
    setDeletePopupMounted(false)
    setTimeout(() => {
      setShowDeletePopup(false)
      setItemToDelete(null)
    }, 300)
  }

  const handleSaveChannel = async () => {
    const nameRegex = /^[a-zA-Z0-9 ]+$/
    if (!nameRegex.test(channelName)) {
      setNotificationMessage('Name can only contain letters, numbers and spaces')
      setShowNotification(true)
      return
    }

    const validSources = channelSources.filter(s => s.trim() !== "")
    if (validSources.length === 0) {
      setNotificationMessage('Add at least one source')
      setShowNotification(true)
      return
    }

    const urlRegex = /^https?:\/\/[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+/
    for (const source of validSources) {
      if (!urlRegex.test(source)) {
        setNotificationMessage('Link must start with http:// or https:// and contain domain')
        setShowNotification(true)
        return
      }
    }

    if (channelImageUrl && !urlRegex.test(channelImageUrl)) {
      setNotificationMessage('Logo must be a valid link (http:// or https://)')
      setShowNotification(true)
      return
    }

    setIsSaving(true)
    try {
      const method = editingChannel ? 'PUT' : 'POST'
      const body = editingChannel 
        ? { id: editingChannel.id, name: channelName, sources: validSources, imageUrl: channelImageUrl || undefined }
        : { name: channelName, sources: validSources, imageUrl: channelImageUrl || undefined }

      const response = await fetch('/api/admin/channels', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.success) {
        fetchChannels()
        setPopupMounted(false)
        setTimeout(() => {
          setShowChannelPopup(false)
        }, 300)
        setNotificationMessage(editingChannel ? 'Channel updated' : 'Channel added')
        setShowNotification(true)
      } else {
        setNotificationMessage('Error saving channel')
        setShowNotification(true)
      }
    } catch (error) {
      console.error('Error saving channel:', error)
      setNotificationMessage('Server connection error')
      setShowNotification(true)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveMatch = async () => {
    const nameRegex = /^[a-zA-Z0-9 ]+$/
    if (!nameRegex.test(matchName)) {
      setNotificationMessage('Name can only contain letters, numbers and spaces')
      setShowNotification(true)
      return
    }

    const validSources = matchSources.filter(s => s.trim() !== "")
    if (validSources.length === 0) {
      setNotificationMessage('Add at least one source')
      setShowNotification(true)
      return
    }

    const urlRegex = /^https?:\/\/[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+/
    for (const source of validSources) {
      if (!urlRegex.test(source)) {
        setNotificationMessage('Link must start with http:// or https:// and contain domain')
        setShowNotification(true)
        return
      }
    }

    if (matchImageUrl && !urlRegex.test(matchImageUrl)) {
      setNotificationMessage('Logo must be a valid link (http:// or https://)')
      setShowNotification(true)
      return
    }

    if (!matchExpiresAt) {
      setNotificationMessage('Expires date is required')
      setShowNotification(true)
      return
    }

    const expiresDate = new Date(matchExpiresAt)
    const now = new Date()
    if (expiresDate <= now) {
      setNotificationMessage('Expires date must be in the future')
      setShowNotification(true)
      return
    }

    setIsSaving(true)
    try {
      const method = editingMatch ? 'PUT' : 'POST'
      const body = editingMatch 
        ? { id: editingMatch.id, name: matchName, sources: validSources, imageUrl: matchImageUrl || undefined, expiresAt: matchExpiresAt }
        : { name: matchName, sources: validSources, imageUrl: matchImageUrl || undefined, expiresAt: matchExpiresAt }

      const response = await fetch('/api/admin/matches', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.success) {
        fetchMatches()
        setMatchPopupMounted(false)
        setTimeout(() => {
          setShowMatchPopup(false)
        }, 300)
        setNotificationMessage(editingMatch ? 'Match updated' : 'Match added')
        setShowNotification(true)
      } else {
        setNotificationMessage('Error saving match')
        setShowNotification(true)
      }
    } catch (error) {
      console.error('Error saving match:', error)
      setNotificationMessage('Server connection error')
      setShowNotification(true)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setPopupMounted(false)
    setTimeout(() => {
      setShowChannelPopup(false)
    }, 300)
  }

  const handleCancelMatch = () => {
    setMatchPopupMounted(false)
    setTimeout(() => {
      setShowMatchPopup(false)
    }, 300)
  }

  const addSourceField = () => {
    setChannelSources([...channelSources, ""])
  }

  const removeSourceField = (index: number) => {
    setChannelSources(channelSources.filter((_, i) => i !== index))
  }

  const updateSource = (index: number, value: string) => {
    const newSources = [...channelSources]
    newSources[index] = value
    setChannelSources(newSources)
  }

  const addMatchSourceField = () => {
    setMatchSources([...matchSources, ""])
  }

  const removeMatchSourceField = (index: number) => {
    setMatchSources(matchSources.filter((_, i) => i !== index))
  }

  const updateMatchSource = (index: number, value: string) => {
    const newSources = [...matchSources]
    newSources[index] = value
    setMatchSources(newSources)
  }

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showNotification])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (data.success) {
        setMounted(false)
        setTimeout(() => {
          setIsLoggedIn(true)
          setShowNotification(false)
          fetchChannels()
          fetchMatches()
        }, 100)
      } else {
        setNotificationMessage(data.message || 'Invalid username or password')
        setShowNotification(true)
        setUsername("")
        setPassword("")
      }
    } catch (error) {
      console.error('Login error:', error)
      setNotificationMessage('Server connection error')
      setShowNotification(true)
    }
  }

  const handleLogout = async () => {
    try {
      setMounted(false)
      await fetch('/api/auth/logout', { method: 'POST' })
      setTimeout(() => {
        setIsLoggedIn(false)
      }, 100)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (isLoggedIn) {
    return (
      <>
        <div className="min-h-screen pt-24 md:pt-32">
          <section className="py-16 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
              <div 
                className={`mb-12 md:mb-16 transition-all duration-700 ${
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                <div className="mb-6">
                  <div className="flex items-start justify-between gap-4 mb-3 md:mb-4">
                    <p className="text-primary text-xs md:text-sm font-medium tracking-[0.2em] uppercase">
                      PANEL
                    </p>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 rounded-lg bg-secondary/80 backdrop-blur-md border border-border/50 text-sm font-medium text-foreground hover:bg-secondary active:scale-95 transition-all duration-200 touch-action-manipulation"
                    >
                      Logout
                    </button>
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-foreground tracking-tight mb-4 md:mb-6">
                    Admin
                  </h1>
                  <p className="text-muted-foreground text-base md:text-lg">
                    Manage kqChannels content
                  </p>
                </div>
              </div>
            
              <div 
                className={`transition-all duration-700 delay-150 ${
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                }`}
              >
                <div className="space-y-4">
                  <div className="rounded-2xl bg-secondary/20 border border-border/30 p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                      <button
                        onClick={() => setChannelsExpanded(!channelsExpanded)}
                        className="flex items-center gap-3 touch-action-manipulation"
                      >
                        <h2 className="text-xl md:text-2xl font-bold text-foreground">Channels</h2>
                        <div className={`transition-transform duration-300 ${channelsExpanded ? 'rotate-180' : 'rotate-0'}`}>
                          <ChevronDown className="w-5 h-5" />
                        </div>
                      </button>
                      {channelsExpanded && (
                        <button
                          onClick={handleAddChannel}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all duration-200 hover:bg-primary/90 active:scale-95 hover:shadow-lg hover:shadow-primary/20 touch-action-manipulation"
                        >
                          <Plus className="w-4 h-4" />
                          Add Channel
                        </button>
                      )}
                    </div>
                  
                    <div 
                      className={`overflow-hidden transition-all duration-500 ease-in-out ${
                        channelsExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="space-y-3">
                        {channels.length === 0 ? (
                          <p className="text-muted-foreground text-center py-8">No channels</p>
                        ) : (
                          channels.map((channel) => (
                            <div key={channel.id} className="p-4 rounded-lg bg-background border border-border/50 flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-foreground font-medium mb-1">{channel.name}</p>
                                <p className="text-sm text-muted-foreground mb-2">/{channel.slug}</p>
                                <p className="text-xs text-muted-foreground">{channel.sources.length} sources</p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditChannel(channel)}
                                  className="p-2 rounded-lg bg-secondary/80 border border-border/50 text-foreground hover:bg-secondary active:scale-95 transition-all duration-200 touch-action-manipulation"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(channel.id, channel.name, 'channel')}
                                  className="p-2 rounded-lg bg-secondary/80 border border-border/50 text-foreground hover:bg-secondary active:scale-95 transition-all duration-200 touch-action-manipulation"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-secondary/20 border border-border/30 p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                      <button
                        onClick={() => setMatchesExpanded(!matchesExpanded)}
                        className="flex items-center gap-3 touch-action-manipulation"
                      >
                        <h2 className="text-xl md:text-2xl font-bold text-foreground">Matches</h2>
                        <div className={`transition-transform duration-300 ${matchesExpanded ? 'rotate-180' : 'rotate-0'}`}>
                          <ChevronDown className="w-5 h-5" />
                        </div>
                      </button>
                      {matchesExpanded && (
                        <button
                          onClick={handleAddMatch}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all duration-200 hover:bg-primary/90 active:scale-95 hover:shadow-lg hover:shadow-primary/20 touch-action-manipulation"
                        >
                          <Plus className="w-4 h-4" />
                          Add Match
                        </button>
                      )}
                    </div>
                  
                    <div 
                      className={`overflow-hidden transition-all duration-500 ease-in-out ${
                        matchesExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="space-y-3">
                        {matches.length === 0 ? (
                          <p className="text-muted-foreground text-center py-8">No matches</p>
                        ) : (
                          matches.map((match) => (
                            <div key={match.id} className="p-4 rounded-lg bg-background border border-border/50 flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-foreground font-medium mb-1">{match.name}</p>
                                <p className="text-sm text-muted-foreground mb-2">/{match.slug}</p>
                                <p className="text-xs text-muted-foreground">{match.sources.length} sources</p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditMatch(match)}
                                  className="p-2 rounded-lg bg-secondary/80 border border-border/50 text-foreground hover:bg-secondary active:scale-95 transition-all duration-200 touch-action-manipulation"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(match.id, match.name, 'match')}
                                  className="p-2 rounded-lg bg-secondary/80 border border-border/50 text-foreground hover:bg-secondary active:scale-95 transition-all duration-200 touch-action-manipulation"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {showChannelPopup && (
          <div 
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
              popupMounted ? "bg-background/80 backdrop-blur-sm" : "bg-background/0"
            }`}
            onClick={handleCancel}
          >
            <div 
              className={`w-full max-w-md rounded-2xl bg-secondary/95 backdrop-blur-md border border-border/50 p-6 md:p-8 transition-all duration-300 ease-out max-h-[85vh] overflow-y-auto ${
                popupMounted ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {editingChannel ? 'Edit Channel' : 'Add Channel'}
              </h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Channel Name
                  </label>
                  <input
                    type="text"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g. Canal Plus Sport 1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Only letters, numbers and spaces</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Channel Logo (optional)
                  </label>
                  <input
                    type="text"
                    value={channelImageUrl}
                    onChange={(e) => setChannelImageUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Image link (jpg, png, svg)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Sources
                  </label>
                  {channelSources.map((source, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={source}
                        onChange={(e) => updateSource(index, e.target.value)}
                        className="flex-1 px-4 py-3 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                        placeholder="https://..."
                      />
                      {channelSources.length > 1 && (
                        <button
                          onClick={() => removeSourceField(index)}
                          className="px-3 py-3 rounded-lg bg-secondary/80 border border-border/50 text-foreground hover:bg-secondary active:scale-95 transition-all duration-200 touch-action-manipulation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addSourceField}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 active:scale-95 transition-all duration-200 touch-action-manipulation"
                  >
                    <Plus className="w-4 h-4" />
                    Add Source
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveChannel}
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium transition-all duration-200 hover:bg-primary/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed touch-action-manipulation"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 rounded-lg bg-secondary/80 border border-border/50 text-foreground font-medium transition-all duration-200 hover:bg-secondary active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed touch-action-manipulation"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showMatchPopup && (
          <div 
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
              matchPopupMounted ? "bg-background/80 backdrop-blur-sm" : "bg-background/0"
            }`}
            onClick={handleCancelMatch}
          >
            <div 
              className={`w-full max-w-md rounded-2xl bg-secondary/95 backdrop-blur-md border border-border/50 p-6 md:p-8 transition-all duration-300 ease-out max-h-[85vh] overflow-y-auto ${
                matchPopupMounted ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {editingMatch ? 'Edit Match' : 'Add Match'}
              </h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Match Name
                  </label>
                  <input
                    type="text"
                    value={matchName}
                    onChange={(e) => setMatchName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g. Real Madrid vs Barcelona"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Only letters, numbers and spaces</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Match Logo (optional)
                  </label>
                  <input
                    type="text"
                    value={matchImageUrl}
                    onChange={(e) => setMatchImageUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Image link (jpg, png, svg)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Expires date
                  </label>
                  <input
                    type="datetime-local"
                    value={matchExpiresAt}
                    onChange={(e) => setMatchExpiresAt(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Match will be automatically deleted at this time</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Sources
                  </label>
                  {matchSources.map((source, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={source}
                        onChange={(e) => updateMatchSource(index, e.target.value)}
                        className="flex-1 px-4 py-3 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                        placeholder="https://..."
                      />
                      {matchSources.length > 1 && (
                        <button
                          onClick={() => removeMatchSourceField(index)}
                          className="px-3 py-3 rounded-lg bg-secondary/80 border border-border/50 text-foreground hover:bg-secondary active:scale-95 transition-all duration-200 touch-action-manipulation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addMatchSourceField}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 active:scale-95 transition-all duration-200 touch-action-manipulation"
                  >
                    <Plus className="w-4 h-4" />
                    Add Source
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveMatch}
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium transition-all duration-200 hover:bg-primary/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed touch-action-manipulation"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelMatch}
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 rounded-lg bg-secondary/80 border border-border/50 text-foreground font-medium transition-all duration-200 hover:bg-secondary active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed touch-action-manipulation"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeletePopup && (
          <div 
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
              deletePopupMounted ? "bg-background/80 backdrop-blur-sm" : "bg-background/0"
            }`}
            onClick={cancelDelete}
          >
            <div 
              className={`w-full max-w-md rounded-2xl bg-secondary/95 backdrop-blur-md border border-border/50 p-6 md:p-8 transition-all duration-300 ease-out ${
                deletePopupMounted ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Delete {itemToDelete?.type === 'channel' ? 'Channel' : 'Match'}
              </h2>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete {itemToDelete?.type === 'channel' ? 'channel' : 'match'} <span className="font-medium text-foreground">{itemToDelete?.name}</span>? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 rounded-lg bg-destructive text-white font-medium transition-all duration-200 hover:bg-destructive/90 active:scale-95 touch-action-manipulation"
                >
                  Delete
                </button>
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-6 py-3 rounded-lg bg-secondary/80 border border-border/50 text-foreground font-medium transition-all duration-200 hover:bg-secondary active:scale-95 touch-action-manipulation"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
            showNotification ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
        >
          <div className="px-6 py-4 rounded-lg bg-secondary/90 backdrop-blur-md border border-border/50 shadow-lg">
            <p className="text-muted-foreground text-sm">
              {notificationMessage}
            </p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div 
            className={`mb-8 text-center transition-all duration-700 ease-out ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Login
            </h1>
            <p className="text-muted-foreground">
              kqChannels Admin Panel
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div 
              className={`rounded-2xl bg-secondary/20 border border-border/30 p-6 md:p-8 transition-all duration-700 delay-150 ease-out ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="Enter username"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-6 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium transition-all duration-200 hover:bg-primary/90 active:scale-95 touch-action-manipulation"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>

      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
          showNotification ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="px-6 py-4 rounded-lg bg-secondary/90 backdrop-blur-md border border-border/50 shadow-lg">
          <p className="text-muted-foreground text-sm">
            {notificationMessage}
          </p>
        </div>
      </div>
    </>
  )
}
