"use client"

import { useEffect, useState } from "react"
import { Hash } from "lucide-react"
import Link from "next/link"

interface Match {
  id: string
  name: string
  slug: string
  sources: string[]
  imageUrl?: string
}

export function MatchesSection() {
  const [mounted, setMounted] = useState(false)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches')
      const data = await response.json()
      if (data.matches) {
        const sortedMatches = data.matches.sort((a: Match, b: Match) => 
          a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
        )
        setMatches(sortedMatches)
      }
    } catch (error) {
      console.error('Error fetching matches:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="min-h-[80vh] py-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div 
          className={`mb-12 md:mb-16 transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-primary text-xs md:text-sm font-medium tracking-[0.2em] uppercase mb-3 md:mb-4">
            Matches
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-foreground tracking-tight mb-4 md:mb-6">
            Live Matches
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
            Watch live football matches from the best leagues
          </p>
        </div>

        <div 
          className={`transition-all duration-700 delay-150 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading matches...</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No matches available</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {matches.map((match) => (
                <Link
                  key={match.id}
                  href={`/match/${match.slug}/1`}
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/40 to-secondary/20 border border-primary/30 p-4 md:p-6 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:border-primary/50 touch-action-manipulation"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent" />
                  <div className="relative z-10 flex items-center gap-3 md:gap-4">
                    {match.imageUrl ? (
                      <img 
                        src={match.imageUrl} 
                        alt=""
                        loading="lazy"
                        className="w-16 h-8 md:w-20 md:h-10 rounded-lg object-contain flex-shrink-0 bg-secondary/30"
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
                      <Hash className="w-6 h-6 text-primary flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-bold text-foreground mb-1 truncate">
                        {match.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {match.sources.length} {match.sources.length === 1 ? 'source' : 'sources'}
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
