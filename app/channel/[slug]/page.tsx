"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { notFound } from "next/navigation"

interface Channel {
  id: string
  name: string
  slug: string
  sources: string[]
}

export default function ChannelPage() {
  const params = useParams()
  const slug = params.slug as string
  const [channel, setChannel] = useState<Channel | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSource, setSelectedSource] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchChannel()
  }, [slug])

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
      }
    } catch (error) {
      console.error('Error fetching channel:', error)
    } finally {
      setLoading(false)
    }
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

  return (
    <div className="min-h-screen pt-32 md:pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div 
          className={`mb-8 transition-all duration-1000 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {channel.name}
          </h1>
          <p className="text-muted-foreground">
            Transmisja na żywo
          </p>
        </div>

        <div 
          className={`flex flex-col lg:flex-row gap-6 transition-all duration-1000 delay-200 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex-1 order-2 lg:order-1">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={channel.sources[selectedSource]}
                className="absolute top-0 left-0 w-full h-full rounded-2xl border border-border/30 bg-background"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </div>

          <div className="w-full lg:w-64 flex flex-col gap-4 order-1 lg:order-2">
            <h2 className="text-lg font-bold text-foreground mb-0">Źródła</h2>
            <div className="flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible scrollbar-hide pb-2 lg:pb-0">
              {channel.sources.map((source, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedSource(index)}
                  className={`flex-shrink-0 lg:w-full px-4 py-3 rounded-lg text-left font-medium transition-all duration-300 whitespace-nowrap lg:whitespace-normal min-w-[120px] border touch-action-manipulation ${
                    selectedSource === index
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                      : 'bg-secondary/50 border-border/50 text-foreground hover:bg-secondary active:bg-secondary hover:scale-105 active:scale-105'
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
