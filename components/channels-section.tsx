"use client"

import { useEffect, useState, useRef } from "react"
import { Hash, AlertCircle } from "lucide-react"
import Link from "next/link"

interface Channel {
  id: string
  name: string
  slug: string
  sources: string[]
  imageUrl?: string
}

function ChannelSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-secondary/20 border border-border/30 p-4 md:p-6 animate-pulse">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="w-16 h-8 md:w-20 md:h-10 rounded-lg bg-secondary/50 flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-6 bg-secondary/50 rounded w-3/4" />
          <div className="h-4 bg-secondary/50 rounded w-1/4" />
        </div>
      </div>
    </div>
  )
}

export function ChannelsSection() {
  const [mounted, setMounted] = useState(false)
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    setMounted(true)
    fetchChannels()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0')
            setVisibleItems((prev) => new Set(prev).add(index))
          }
        })
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  const fetchChannels = async () => {
    try {
      const response = await fetch('/api/channels')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      if (data.channels) {
        const sortedChannels = data.channels.sort((a: Channel, b: Channel) => 
          a.name.localeCompare(b.name, 'pl', { sensitivity: 'base' })
        )
        setChannels(sortedChannels)
        setError(false)
      }
    } catch (error) {
      console.error('Error fetching channels:', error)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!loading && channels.length > 0) {
      const elements = document.querySelectorAll('[data-index]')
      elements.forEach((el) => {
        observerRef.current?.observe(el)
      })
    }
  }, [loading, channels])

  return (
    <section className="min-h-[80vh] py-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div 
          className={`mb-12 md:mb-16 transition-all duration-700 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-primary text-xs md:text-sm font-medium tracking-[0.2em] uppercase mb-3 md:mb-4">
            Kanały
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-foreground tracking-tight mb-4 md:mb-6">
            Channels
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
            Oglądaj mecze piłki nożnej na żywo z najlepszych lig świata
          </p>
        </div>

        <div 
          className={`transition-all duration-700 delay-150 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          {loading ? (
            <div className="grid gap-4">
              {[...Array(5)].map((_, i) => (
                <ChannelSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Błąd ładowania</h3>
              <p className="text-muted-foreground mb-4">Nie udało się załadować kanałów</p>
              <button
                onClick={fetchChannels}
                className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 active:scale-95 transition-all duration-200 touch-action-manipulation"
              >
                Spróbuj ponownie
              </button>
            </div>
          ) : channels.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/50 mb-4">
                <Hash className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Brak kanałów</h3>
              <p className="text-muted-foreground">Nie ma jeszcze dostępnych kanałów</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {channels.map((channel, index) => (
                <Link
                  key={channel.id}
                  href={`/channel/${channel.slug}/1`}
                  data-index={index}
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/25 via-secondary/50 to-secondary/30 border border-primary/40 p-4 md:p-6 transition-all duration-150 ease-out hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10 active:scale-[0.98] hover:border-primary/60 touch-action-manipulation will-change-transform ${
                    visibleItems.has(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${index * 25}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 flex items-center gap-3 md:gap-4">
                    {channel.imageUrl ? (
                      <img 
                        src={channel.imageUrl} 
                        alt=""
                        loading="lazy"
                        className="w-16 h-8 md:w-20 md:h-10 rounded-lg object-contain flex-shrink-0 bg-secondary/30 transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.currentTarget
                          const parent = target.parentElement
                          if (parent && !parent.querySelector('svg')) {
                            target.style.display = 'none'
                            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
                            svg.setAttribute('class', 'w-6 h-6 text-primary flex-shrink-0')
                            svg.setAttribute('fill', 'none')
                            svg.setAttribute('stroke', 'currentColor')
                            svg.setAttribute('viewBox', '0 0 24 24')
                            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
                            path.setAttribute('stroke-linecap', 'round')
                            path.setAttribute('stroke-linejoin', 'round')
                            path.setAttribute('stroke-width', '2')
                            path.setAttribute('d', 'M7 20l4-16m2 16l4-16M6 9h14M4 15h14')
                            svg.appendChild(path)
                            parent.insertBefore(svg, target)
                          }
                        }}
                      />
                    ) : (
                      <Hash className="w-6 h-6 text-primary flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-bold text-foreground mb-1 truncate transition-colors duration-200 group-hover:text-primary">
                        {channel.name}
                      </h3>
                      <p className="text-sm text-muted-foreground transition-colors duration-200 group-hover:text-foreground/80">
                        {channel.sources.length} {channel.sources.length === 1 ? 'źródło' : 'źródeł'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
