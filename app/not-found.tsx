"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function NotFound() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 pt-32">
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
          className={`text-8xl md:text-9xl font-bold tracking-tighter mb-4 transition-all duration-1000 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{
            textShadow: "0 0 60px oklch(0.75 0.15 195 / 0.4)",
          }}
        >
          404
        </h1>
        <p className={`text-muted-foreground text-lg md:text-xl mb-8 transition-all duration-1000 delay-200 ease-out ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          This page doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all duration-1000 delay-300 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
