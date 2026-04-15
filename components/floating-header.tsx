"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
import Image from "next/image"

export function FloatingHeader() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])
  
  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path === "/channels" && (pathname === "/channels" || pathname.startsWith('/channel/'))) return true
    if (path === "/matches" && (pathname === "/matches" || pathname.startsWith('/match/'))) return true
    if (path === "/panel" && pathname === "/admin") return true
    return false
  }

  const handleLinkClick = () => {
    setMobileMenuOpen(false)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 pt-6 md:pt-8 px-4 pb-6">
        <nav className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-5 rounded-2xl bg-secondary/50 backdrop-blur-xl border border-border/50 shadow-lg shadow-black/5 will-change-transform">
          <div className="flex items-center justify-between relative z-10">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 md:w-10 md:h-10 relative flex-shrink-0 rounded-lg overflow-hidden">
                <Image 
                  src="/icon.svg" 
                  alt="kqChannels" 
                  width={40} 
                  height={40}
                  className="w-full h-full transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <span className="text-lg md:text-xl font-bold text-foreground tracking-tight">
                kqChannels
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/channels"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive("/channels")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                Channels
              </Link>
              
              <Link
                href="/"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive("/")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                kq
              </Link>

              <Link
                href="/matches"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive("/matches")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                Matches
              </Link>
            </div>

            <div className="hidden md:block">
              <Link
                href="/admin"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive("/panel")
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                Panel
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-foreground hover:bg-secondary/50 transition-all duration-200"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </nav>
      </header>

      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          className={`absolute inset-0 transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'bg-background/80 backdrop-blur-sm' : 'bg-background/0 backdrop-blur-none'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />
        
        <div 
          className={`absolute top-28 left-4 right-4 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'
          }`}
        >
          <div className="p-4 space-y-2">
            <Link
              href="/channels"
              onClick={handleLinkClick}
              className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                isActive("/channels")
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-secondary/50"
              }`}
            >
              Channels
            </Link>
            
            <Link
              href="/"
              onClick={handleLinkClick}
              className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                isActive("/")
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-secondary/50"
              }`}
            >
              kq
            </Link>

            <Link
              href="/matches"
              onClick={handleLinkClick}
              className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                isActive("/matches")
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-secondary/50"
              }`}
            >
              Matches
            </Link>

            <div className="pt-2 mt-2 border-t border-border/50">
              <Link
                href="/admin"
                onClick={handleLinkClick}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                  isActive("/panel")
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary/50"
                }`}
              >
                Panel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
