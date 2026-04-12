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

    const channelsSnapshot = await adminDb.collection('channels').orderBy('createdAt', 'desc').get()
    const channels = channelsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json({ channels })
  } catch (error) {
    console.error('Error fetching channels:', error)
    return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')
    
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, sources, imageUrl } = await request.json()

    if (!name || !sources || sources.length === 0) {
      return NextResponse.json({ error: 'Name and at least one source required' }, { status: 400 })
    }

    const nameRegex = /^[a-zA-Z0-9 ]+$/
    if (!nameRegex.test(name)) {
      return NextResponse.json({ error: 'Name can only contain letters, numbers and spaces' }, { status: 400 })
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-')

    const channelData: any = {
      name,
      slug,
      sources,
      createdAt: new Date().toISOString()
    }

    if (imageUrl) {
      channelData.imageUrl = imageUrl
    }

    const channelRef = await adminDb.collection('channels').add(channelData)

    return NextResponse.json({ success: true, id: channelRef.id })
  } catch (error) {
    console.error('Error creating channel:', error)
    return NextResponse.json({ error: 'Failed to create channel' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')
    
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, name, sources, imageUrl } = await request.json()

    if (!id || !name || !sources || sources.length === 0) {
      return NextResponse.json({ error: 'ID, name and at least one source required' }, { status: 400 })
    }

    const nameRegex = /^[a-zA-Z0-9 ]+$/
    if (!nameRegex.test(name)) {
      return NextResponse.json({ error: 'Name can only contain letters, numbers and spaces' }, { status: 400 })
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-')

    const updateData: any = {
      name,
      slug,
      sources
    }

    if (imageUrl) {
      updateData.imageUrl = imageUrl
    }

    await adminDb.collection('channels').doc(id).update(updateData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating channel:', error)
    return NextResponse.json({ error: 'Failed to update channel' }, { status: 500 })
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

    await adminDb.collection('channels').doc(id).delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting channel:', error)
    return NextResponse.json({ error: 'Failed to delete channel' }, { status: 500 })
  }
}
