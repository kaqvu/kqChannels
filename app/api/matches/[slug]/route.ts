import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const matchesSnapshot = await adminDb.collection('matches').where('slug', '==', slug).limit(1).get()

    if (matchesSnapshot.empty) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    const match = {
      id: matchesSnapshot.docs[0].id,
      ...matchesSnapshot.docs[0].data()
    }

    return NextResponse.json({ match })
  } catch (error) {
    console.error('Error fetching match:', error)
    return NextResponse.json({ error: 'Failed to fetch match' }, { status: 500 })
  }
}
