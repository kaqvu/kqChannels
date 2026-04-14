"use client"

import { useEffect, useState } from "react"

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/20" />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] opacity-[0.07] blur-[100px] pointer-events-none"
        style={{ background: "var(--primary)" }}
      />
      <div className="relative z-10 text-center px-4">
        <h1
          className={`text-[clamp(4rem,15vw,10rem)] font-bold tracking-[-0.04em] leading-none mb-6 transition-all duration-700 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          kq
        </h1>
        <p 
          className={`text-muted-foreground text-lg md:text-xl max-w-md mx-auto transition-all duration-700 delay-150 ease-out text-balance ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Streamy meczów piłki nożnej
        </p>
      </div>
    </section>
  )
}
