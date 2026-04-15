import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')
    
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const matchesSnapshot = await adminDb.collection('matches').orderBy('createdAt', 'desc').get()
    const matches = matchesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json({ matches })
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')
    
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, sources, imageUrl, expiresAt } = await request.json()

    if (!name || !sources || sources.length === 0) {
      return NextResponse.json({ error: 'Name and at least one source required' }, { status: 400 })
    }

    if (!expiresAt) {
      return NextResponse.json({ error: 'Expires date is required' }, { status: 400 })
    }

    const nameRegex = /^[a-zA-Z0-9 ]+$/
    if (!nameRegex.test(name)) {
      return NextResponse.json({ error: 'Name can only contain letters, numbers and spaces' }, { status: 400 })
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-')

    const matchData: any = {
      name,
      slug,
      sources,
      expiresAt,
      createdAt: new Date().toISOString()
    }

    if (imageUrl) {
      matchData.imageUrl = imageUrl
    }

    const matchRef = await adminDb.collection('matches').add(matchData)

    return NextResponse.json({ success: true, id: matchRef.id })
  } catch (error) {
    console.error('Error creating match:', error)
    return NextResponse.json({ error: 'Failed to create match' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')
    
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, name, sources, imageUrl, expiresAt } = await request.json()

    if (!id || !name || !sources || sources.length === 0) {
      return NextResponse.json({ error: 'ID, name and at least one source required' }, { status: 400 })
    }

    if (!expiresAt) {
      return NextResponse.json({ error: 'Expires date is required' }, { status: 400 })
    }

    const nameRegex = /^[a-zA-Z0-9 ]+$/
    if (!nameRegex.test(name)) {
      return NextResponse.json({ error: 'Name can only contain letters, numbers and spaces' }, { status: 400 })
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-')

    const updateData: any = {
      name,
      slug,
      sources,
      expiresAt
    }

    if (imageUrl) {
      updateData.imageUrl = imageUrl
    }

    await adminDb.collection('matches').doc(id).update(updateData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating match:', error)
    return NextResponse.json({ error: 'Failed to update match' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')
    
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    await adminDb.collection('matches').doc(id).delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting match:', error)
    return NextResponse.json({ error: 'Failed to delete match' }, { status: 500 })
  }
}
