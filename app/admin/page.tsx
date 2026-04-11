"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Edit2 } from "lucide-react"

interface Channel {
  id: string
  name: string
  slug: string
  sources: string[]
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
  const [isSaving, setIsSaving] = useState(false)
  const [showDeletePopup, setShowDeletePopup] = useState(false)
  const [deletePopupMounted, setDeletePopupMounted] = useState(false)
  const [channelToDelete, setChannelToDelete] = useState<{ id: string, name: string } | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check')
        const data = await response.json()
        setIsLoggedIn(data.authenticated)
        
        if (data.authenticated) {
          fetchChannels()
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
          a.name.localeCompare(b.name, 'pl', { sensitivity: 'base' })
        )
        setChannels(sortedChannels)
      }
    } catch (error) {
      console.error('Error fetching channels:', error)
    }
  }

  const handleAddChannel = () => {
    setEditingChannel(null)
    setChannelName("")
    setChannelSources([""])
    setShowChannelPopup(true)
    setTimeout(() => {
      setPopupMounted(true)
    }, 50)
  }

  const handleEditChannel = (channel: Channel) => {
    setEditingChannel(channel)
    setChannelName(channel.name)
    setChannelSources(channel.sources)
    setShowChannelPopup(true)
    setTimeout(() => {
      setPopupMounted(true)
    }, 50)
  }

  const handleDeleteChannel = async (id: string, name: string) => {
    setChannelToDelete({ id, name })
    setShowDeletePopup(true)
    setTimeout(() => {
      setDeletePopupMounted(true)
    }, 50)
  }

  const confirmDelete = async () => {
    if (!channelToDelete) return

    try {
      const response = await fetch('/api/admin/channels', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: channelToDelete.id }),
      })

      const data = await response.json()

      if (data.success) {
        fetchChannels()
        setNotificationMessage('Kanał usunięty')
        setShowNotification(true)
      } else {
        setNotificationMessage('Błąd usuwania kanału')
        setShowNotification(true)
      }
    } catch (error) {
      console.error('Error deleting channel:', error)
      setNotificationMessage('Błąd połączenia z serwerem')
      setShowNotification(true)
    } finally {
      setDeletePopupMounted(false)
      setTimeout(() => {
        setShowDeletePopup(false)
        setChannelToDelete(null)
      }, 300)
    }
  }

  const cancelDelete = () => {
    setDeletePopupMounted(false)
    setTimeout(() => {
      setShowDeletePopup(false)
      setChannelToDelete(null)
    }, 300)
  }

  const handleSaveChannel = async () => {
    const nameRegex = /^[a-zA-Z0-9 ]+$/
    if (!nameRegex.test(channelName)) {
      setNotificationMessage('Nazwa może zawierać tylko litery, cyfry i spacje')
      setShowNotification(true)
      return
    }

    const validSources = channelSources.filter(s => s.trim() !== "")
    if (validSources.length === 0) {
      setNotificationMessage('Dodaj przynajmniej jedno źródło')
      setShowNotification(true)
      return
    }

    const urlRegex = /^https?:\/\/[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+/
    for (const source of validSources) {
      if (!urlRegex.test(source)) {
        setNotificationMessage('Link musi zaczynać się od http:// lub https:// i zawierać domenę (np. example.com)')
        setShowNotification(true)
        return
      }
    }

    setIsSaving(true)
    try {
      const method = editingChannel ? 'PUT' : 'POST'
      const body = editingChannel 
        ? { id: editingChannel.id, name: channelName, sources: validSources }
        : { name: channelName, sources: validSources }

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
        setNotificationMessage(editingChannel ? 'Kanał zaktualizowany' : 'Kanał dodany')
        setShowNotification(true)
      } else {
        setNotificationMessage('Błąd zapisu kanału')
        setShowNotification(true)
      }
    } catch (error) {
      console.error('Error saving channel:', error)
      setNotificationMessage('Błąd połączenia z serwerem')
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
        }, 100)
      } else {
        setNotificationMessage(data.message || 'Nieprawidłowy login lub hasło')
        setShowNotification(true)
        setUsername("")
        setPassword("")
      }
    } catch (error) {
      console.error('Login error:', error)
      setNotificationMessage('Błąd połączenia z serwerem')
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
        <div className="text-muted-foreground">Ładowanie...</div>
      </div>
    )
  }

  if (isLoggedIn) {
    return (
      <>
        <div className="min-h-screen px-4 pt-24 pb-16">
          <div className="w-full max-w-6xl mx-auto">
            <div 
              className={`mb-8 flex items-center justify-between transition-all duration-1000 ease-out will-change-[opacity,transform] ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                  Panel Admina
                </h1>
                <p className="text-muted-foreground">
                  Zarządzaj kanałami kqChannels
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-secondary/80 backdrop-blur-md border border-border/50 text-sm font-medium text-foreground hover:bg-secondary hover:scale-105 active:scale-105 transition-all duration-300 touch-action-manipulation"
              >
                Wyloguj
              </button>
            </div>
            
            <div 
              className={`rounded-2xl bg-secondary/20 border border-border/30 p-8 transition-all duration-1000 delay-200 ease-out will-change-[opacity,transform] ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Kanały</h2>
                <button
                  onClick={handleAddChannel}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all duration-300 hover:bg-primary/90 hover:scale-105 active:scale-105 hover:shadow-lg hover:shadow-primary/20 touch-action-manipulation"
                >
                  <Plus className="w-4 h-4" />
                  Dodaj kanał
                </button>
              </div>
              
              <div className="space-y-3">
                {channels.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Brak kanałów</p>
                ) : (
                  channels.map((channel) => (
                    <div key={channel.id} className="p-4 rounded-lg bg-background border border-border/50 flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-foreground font-medium mb-1">{channel.name}</p>
                        <p className="text-sm text-muted-foreground mb-2">/{channel.slug}</p>
                        <p className="text-xs text-muted-foreground">{channel.sources.length} źródeł</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditChannel(channel)}
                          className="p-2 rounded-lg bg-secondary/80 border border-border/50 text-foreground hover:bg-secondary hover:scale-110 active:scale-110 transition-all duration-300 touch-action-manipulation"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteChannel(channel.id, channel.name)}
                          className="p-2 rounded-lg bg-secondary/80 border border-border/50 text-foreground hover:bg-secondary hover:scale-110 active:scale-110 transition-all duration-300 touch-action-manipulation"
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

        {showChannelPopup && (
          <div 
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
              popupMounted ? "bg-background/80 backdrop-blur-sm" : "bg-background/0"
            }`}
            onClick={handleCancel}
          >
            <div 
              className={`w-full max-w-md rounded-2xl bg-secondary/95 backdrop-blur-md border border-border/50 p-8 transition-all duration-500 ease-out will-change-[opacity,transform] max-h-[90vh] overflow-y-auto ${
                popupMounted ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {editingChannel ? 'Edytuj kanał' : 'Dodaj kanał'}
              </h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nazwa kanału
                  </label>
                  <input
                    type="text"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="np. Canal Plus Sport 1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Tylko litery, cyfry i spacje</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Źródła
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
                          className="px-3 py-3 rounded-lg bg-secondary/80 border border-border/50 text-foreground hover:bg-secondary hover:scale-110 active:scale-110 transition-all duration-300 touch-action-manipulation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addSourceField}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 hover:scale-105 active:scale-105 transition-all duration-300 touch-action-manipulation"
                  >
                    <Plus className="w-4 h-4" />
                    Dodaj źródło
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveChannel}
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium transition-all duration-300 hover:bg-primary/90 hover:scale-105 active:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100 touch-action-manipulation"
                >
                  {isSaving ? 'Zapisywanie...' : 'Zapisz'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 rounded-lg bg-secondary/80 border border-border/50 text-foreground font-medium transition-all duration-300 hover:bg-secondary hover:scale-105 active:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100 touch-action-manipulation"
                >
                  Anuluj
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
              className={`w-full max-w-md rounded-2xl bg-secondary/95 backdrop-blur-md border border-border/50 p-8 transition-all duration-500 ease-out will-change-[opacity,transform] ${
                deletePopupMounted ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Usuń kanał
              </h2>
              <p className="text-muted-foreground mb-6">
                Czy na pewno chcesz usunąć kanał <span className="font-medium text-foreground">{channelToDelete?.name}</span>? Tej operacji nie można cofnąć.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 rounded-lg bg-destructive text-white font-medium transition-all duration-300 hover:bg-destructive/90 hover:scale-105 active:scale-105 touch-action-manipulation"
                >
                  Usuń
                </button>
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-6 py-3 rounded-lg bg-secondary/80 border border-border/50 text-foreground font-medium transition-all duration-300 hover:bg-secondary hover:scale-105 active:scale-105 touch-action-manipulation"
                >
                  Anuluj
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
            className={`mb-8 text-center transition-all duration-1000 ease-out will-change-[opacity,transform] ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Logowanie
            </h1>
            <p className="text-muted-foreground">
              Panel administracyjny kqChannels
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div 
              className={`rounded-2xl bg-secondary/20 border border-border/30 p-8 transition-all duration-1000 delay-200 ease-out ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                    Login
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="Wprowadź login"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                    Hasło
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="Wprowadź hasło"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-6 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium transition-all duration-300 hover:bg-primary/90 hover:scale-105 active:scale-105 touch-action-manipulation"
              >
                Zaloguj
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
