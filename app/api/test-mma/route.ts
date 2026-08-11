import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const res = await fetch('https://mmaapi.p.rapidapi.com/events', {
      headers: {
        'x-rapidapi-host': 'mmaapi.p.rapidapi.com',
        'x-rapidapi-key': 'e0d3bf230amsha7e9bcaa7a18fe2p1fb71cjsn8076650ec333',
      },
      cache: 'no-store',
    })
    const status = res.status
    const text = await res.text()
    return NextResponse.json({ 
      status, 
      preview: text.slice(0, 500),
      headers: Object.fromEntries(res.headers.entries())
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
