import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { page_path, referrer } = body
    
    const userAgent = request.headers.get('user-agent') || ''
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    
    // Hash IP untuk privacy
    const ipHash = await hashString(ip)
    
    const supabase = createClient()
    
    await supabase.from('visitor_stats').insert({
      page_path: page_path || '/',
      user_agent: userAgent,
      ip_hash: ipHash,
      referrer: referrer || null,
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking visit:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
