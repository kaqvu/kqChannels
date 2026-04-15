import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST() {
  try {
    const now = new Date().toISOString()
    
    const expiredMatchesSnapshot = await adminDb
      .collection('matches')
      .where('expiresAt', '<=', now)
      .get()

    const deletePromises = expiredMatchesSnapshot.docs.map(doc => doc.ref.delete())
    await Promise.all(deletePromises)

    return NextResponse.json({ 
      success: true, 
      deleted: expiredMatchesSnapshot.size 
    })
  } catch (error) {
    console.error('Error deleting expired matches:', error)
    return NextResponse.json({ error: 'Failed to delete expired matches' }, { status: 500 })
  }
}
