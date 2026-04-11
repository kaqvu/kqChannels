import { Metadata } from "next"
import { ChannelsSection } from "@/components/channels-section"

export const metadata: Metadata = {
  title: "Channels | kqChannels",
  description: "Oglądaj mecze piłki nożnej na żywo",
}

export default function ChannelsPage() {
  return (
    <div className="pt-24 md:pt-32">
      <ChannelsSection />
    </div>
  )
}
