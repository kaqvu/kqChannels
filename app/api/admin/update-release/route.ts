import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const session = request.cookies.get('admin_session')

    if (session?.value !== 'authenticated') {
      return NextResponse.json({ success: false, message: 'Brak autoryzacji' }, { status: 401 })
    }

    const { latestRelease, releaseUrl } = await request.json()

    if (!latestRelease || !releaseUrl) {
      return NextResponse.json({ success: false, message: 'Brak wymaganych danych' }, { status: 400 })
    }

    const docRef = adminDb.collection('launcher').doc('release')
    await docRef.update({
      latestRelease,
      releaseUrl
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json({ success: false, message: 'Błąd serwera' }, { status: 500 })
  }
}
