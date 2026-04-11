import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const channelsSnapshot = await adminDb.collection('channels').where('slug', '==', slug).limit(1).get()

    if (channelsSnapshot.empty) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    }

    const channel = {
      id: channelsSnapshot.docs[0].id,
      ...channelsSnapshot.docs[0].data()
    }

    return NextResponse.json({ channel })
  } catch (error) {
    console.error('Error fetching channel:', error)
    return NextResponse.json({ error: 'Failed to fetch channel' }, { status: 500 })
  }
}
