"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export function FloatingHeader() {
  const pathname = usePathname()
  const [channelName, setChannelName] = useState<string | null>(null)
  const [channelImage, setChannelImage] = useState<string | null>(null)
  
  useEffect(() => {
    if (pathname.startsWith('/channel/')) {
      const slug = pathname.split('/channel/')[1]
      fetchChannelName(slug)
    } else {
      setChannelName(null)
    }
  }, [pathname])

  const fetchChannelName = async (slug: string) => {
    try {
      const response = await fetch(`/api/channels/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setChannelName(data.channel?.name || null)
        setChannelImage(data.channel?.imageUrl || null)
      }
    } catch (error) {
      console.error('Error fetching channel name:', error)
    }
  }
  
  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname === path) return true
    return false
  }

  const isChannelPage = pathname.startsWith('/channel/')

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center gap-2 pt-4 md:pt-6 px-4 pointer-events-none">
      <nav className="flex items-center gap-1 px-1.5 py-1.5 rounded-full bg-secondary/80 backdrop-blur-md border border-border/50 pointer-events-auto">
        <Link
          href="/channels"
          className={`px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
            isActive("/channels")
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Channels
        </Link>
        
        <Link
          href="/"
          className={`px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
            isActive("/") && pathname === "/"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          kq
        </Link>

        <Link
          href="/admin"
          className={`px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
            isActive("/admin")
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Admin
        </Link>
      </nav>
      
      {isChannelPage && channelName && (
        <nav className="flex items-center gap-1 px-1.5 py-1.5 rounded-full bg-secondary/80 backdrop-blur-md border border-border/50 pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-500 max-w-[90vw]">
          <Link
            href="#"
            className="px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all duration-200 bg-foreground text-background flex items-center gap-2 truncate"
            onClick={(e) => e.preventDefault()}
          >
            {channelImage ? (
              <img 
                src={channelImage} 
                alt=""
                className="w-8 h-4 md:w-10 md:h-5 rounded object-contain bg-secondary/30 flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : null}
            <span className="truncate">{channelName}</span>
          </Link>
        </nav>
      )}
    </header>
  )
}
