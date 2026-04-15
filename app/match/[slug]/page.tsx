"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

export default function MatchRedirect() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  useEffect(() => {
    router.replace(`/match/${slug}/1`)
  }, [slug, router])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-muted-foreground">Redirecting...</div>
    </div>
  )
}
