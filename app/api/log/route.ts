import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken"; // or your preferred decoder

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Read JWT from cookies
    const token = cookies().get("auth_token")?.value || null;

    // 2. Decode JWT (no verification needed for logging)
    let decoded: any = null;
    if (token) {
      try {
        decoded = jwt.decode(token);
      } catch (err) {
        console.error("JWT decode failed:", err);
      }
    }

    // 3. Extract user info from JWT
    const userId = decoded?.sub || decoded?.id || null;
    const sessionEmail = decoded?.email || null;
    const sessionUser = decoded?.name || null;

    // 4. Extract IP
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // 5. Extract user agent
    const userAgent = req.headers.get("user-agent") || "unknown";

    // 6. Build log entry
    const logData = {
      level: body.level || "info",
      message: body.message || "",
      data: body.data || null,
      createdAt: new Date(),
      userId,
      page: body.page || null,
      userAgent,
      ipAddress,
      // Optional: include these if you add them to Prisma
      // sessionEmail,
      // sessionUser,
    };
console.log("Log entry data:", logData);
console.log("sessionEmail:", sessionEmail);
console.log("sessionUser:", sessionUser);
    await prisma.log.create({ data: logData });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Log API error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
