import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    const docRef = adminDb.collection('website').doc('credentials')
    const doc = await docRef.get()

    if (!doc.exists) {
      return NextResponse.json({ success: false, message: 'Nieprawidłowy login lub hasło' }, { status: 401 })
    }

    const data = doc.data()
    const validLogin = data?.login
    const validPassword = data?.password

    if (!validLogin || !validPassword) {
      return NextResponse.json({ success: false, message: 'Nieprawidłowy login lub hasło' }, { status: 401 })
    }

    if (username === validLogin && password === validPassword) {
      const response = NextResponse.json({ success: true })
      
      response.cookies.set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24,
      })

      return response
    }

    return NextResponse.json({ success: false, message: 'Nieprawidłowy login lub hasło' }, { status: 401 })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ success: false, message: 'Nieprawidłowy login lub hasło' }, { status: 401 })
  }
}

