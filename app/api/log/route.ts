// app/api/log/route.ts - Client → Server bridge
import { NextRequest, NextResponse } from 'next/server';
import { appLog } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    await appLog(data); // Forwards to database
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Log API error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
