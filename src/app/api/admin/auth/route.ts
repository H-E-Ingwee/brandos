import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { key } = await request.json()
  const adminKey = process.env.ADMIN_SECRET_KEY

  if (!key || key !== adminKey) {
    return NextResponse.json({ error: 'Invalid admin key' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('admin_key', key, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  })
  return response
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('admin_key')
  return response
}