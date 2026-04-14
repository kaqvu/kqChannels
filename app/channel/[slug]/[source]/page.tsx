"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { notFound } from "next/navigation"

interface Channel {
  id: string
  name: string
  slug: string
  sources: string[]
  imageUrl?: string
}

export default function ChannelPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const sourceParam = params.source as string
  const [channel, setChannel] = useState<Channel | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSource, setSelectedSource] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [sourceNotFound, setSourceNotFound] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchChannel()
  }, [slug, sourceParam])

  const fetchChannel = async () => {
    try {
      const response = await fetch(`/api/channels/${slug}`)
      if (response.status === 404) {
        notFound()
        return
      }
      const data = await response.json()
      if (data.channel) {
        setChannel(data.channel)
        
        const sourceIndex = parseInt(sourceParam) - 1
        if (sourceIndex >= 0 && sourceIndex < data.channel.sources.length) {
          setSelectedSource(sourceIndex)
          setSourceNotFound(false)
        } else {
          setSourceNotFound(true)
        }
      }
    } catch (error) {
      console.error('Error fetching channel:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSourceChange = (index: number) => {
    setSelectedSource(index)
    router.push(`/channel/${slug}/${index + 1}`, { scroll: false })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-muted-foreground">Ładowanie...</div>
      </div>
    )
  }

  if (!channel) {
    return notFound()
  }

  if (sourceNotFound) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 pt-28 md:pt-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-15 blur-[100px] animate-pulse"
            style={{
              background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
            }}
          />
        </div>
        <div className="relative z-10 text-center">
          <h1
            className={`text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-4 transition-all duration-700 ease-out ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{
              textShadow: "0 0 60px oklch(0.75 0.15 195 / 0.4)",
            }}
          >
            404
          </h1>
          <p className={`text-muted-foreground text-base md:text-lg lg:text-xl mb-2 transition-all duration-700 delay-150 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            Nie ma takiego źródła
          </p>
          <p className={`text-muted-foreground text-sm md:text-base mb-8 transition-all duration-700 delay-150 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            Kanał {channel.name} ma tylko {channel.sources.length} {channel.sources.length === 1 ? 'źródło' : channel.sources.length < 5 ? 'źródła' : 'źródeł'}
          </p>
          <button
            onClick={() => router.push(`/channel/${slug}/1`)}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all duration-700 delay-200 ease-out ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Przejdź do źródła 1
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-28 md:pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div 
          className={`mb-6 md:mb-8 transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
            {channel.name}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Transmisja na żywo
          </p>
        </div>

        <div 
          className={`flex flex-col lg:flex-row gap-4 md:gap-6 transition-all duration-700 delay-150 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex-1 order-2 lg:order-1">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={channel.sources[selectedSource]}
                className="absolute top-0 left-0 w-full h-full rounded-xl md:rounded-2xl border border-border/30 bg-background"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </div>

          <div className="w-full lg:w-64 flex flex-col gap-3 md:gap-4 order-1 lg:order-2">
            <h2 className="text-base md:text-lg font-bold text-foreground mb-0">Źródła</h2>
            <div className="grid grid-cols-2 sm:flex sm:flex-row lg:flex-col gap-2 md:gap-3">
              {channel.sources.map((source, index) => (
                <button
                  key={index}
                  onClick={() => handleSourceChange(index)}
                  className={`px-3 md:px-4 py-2.5 md:py-3 rounded-lg text-center lg:text-left text-sm md:text-base font-medium transition-all duration-200 border touch-action-manipulation ${
                    selectedSource === index
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                      : 'bg-secondary/50 border-border/50 text-foreground hover:bg-secondary active:scale-95'
                  }`}
                >
                  Źródło {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
