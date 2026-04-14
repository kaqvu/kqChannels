"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

export default function ChannelRedirect() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  useEffect(() => {
    router.replace(`/channel/${slug}/1`)
  }, [slug, router])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-muted-foreground">Przekierowanie...</div>
    </div>
  )
}
