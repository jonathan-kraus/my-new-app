import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.json({ cleared: true });

  const expire = new Date(0).toUTCString();

  const cookieNames = [
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "__Host-next-auth.session-token",
    "next-auth.csrf-token",
    "__Host-authjs.csrf-token",
    "authjs.csrf-token",
    "next-auth.callback-url",
    "__Secure-next-auth.callback-url",
    "__Host-next-auth.callback-url",
  ];

  // set cookies expired for the current host and common variants
  for (const name of cookieNames) {
    // expire for current host
    res.headers.append(
      "Set-Cookie",
      `${name}=; Path=/; Expires=${expire}; HttpOnly; Secure; SameSite=None`,
    );

    // expire for www domain (useful if your site uses www)
    res.headers.append(
      "Set-Cookie",
      `${name}=; Domain=www.kraus.my.id; Path=/; Expires=${expire}; HttpOnly; Secure; SameSite=None`,
    );
  }

  return res;
}
