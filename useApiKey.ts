import { NextResponse } from 'next/server'
import { CHARACTER_STYLES } from '@/lib/styles'

export async function GET() {
  return NextResponse.json(CHARACTER_STYLES)
}
