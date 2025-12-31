// app/api/log/route.ts - HEADERS FROM REQUEST
import { NextRequest, NextResponse } from 'next/server';
import { appLog } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // ✅ Get headers/page from REQUEST (safe!)
    const userAgent = req.headers.get('user-agent') || 'unknown';

    await appLog({
      ...data,
      page: req.nextUrl.pathname,
      userId: data.userId
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Log API error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

