import { auth } from "@/lib/auth";
import {
  setLastAuthResponseHeaders,
  setLastAuthRequestHeaders,
} from "@/lib/auth-debug";

export const runtime = "nodejs";

export async function GET(req: Request) {
  console.error("Auth handler invoked (GET)", {
    url: req.url,
    method: req.method,
    headers: Object.fromEntries(req.headers.entries()),
  });

  try {
    const reqHeaders = Object.fromEntries(req.headers.entries());
    setLastAuthRequestHeaders(reqHeaders);
    console.error("Auth handler request headers:", reqHeaders);

    const res = await auth.handler(req);

    const headers = Object.fromEntries(res.headers.entries());
    setLastAuthResponseHeaders(headers);
    console.error("Auth handler response headers:", headers);

    return res;
  } catch (err) {
    console.error("Auth handler failed:", err);
    console.error("ENV: DATABASE_URL set?", !!process.env.DATABASE_URL);
    console.error("ENV: GITHUB_CLIENT_ID set?", !!process.env.GITHUB_CLIENT_ID);
    console.error(
      "ENV: GITHUB_CLIENT_SECRET set?",
      !!process.env.GITHUB_CLIENT_SECRET,
    );
    throw err;
  }
}

export async function POST(req: Request) {
  console.error("Auth handler invoked (POST)", {
    url: req.url,
    method: req.method,
    headers: Object.fromEntries(req.headers.entries()),
  });

  try {
    const reqHeaders = Object.fromEntries(req.headers.entries());
    setLastAuthRequestHeaders(reqHeaders);
    console.error("Auth handler request headers:", reqHeaders);

    const res = await auth.handler(req);

    const headers = Object.fromEntries(res.headers.entries());
    setLastAuthResponseHeaders(headers);
    console.error("Auth handler response headers:", headers);

    return res;
  } catch (err) {
    console.error("Auth handler failed:", err);
    console.error("ENV: DATABASE_URL set?", !!process.env.DATABASE_URL);
    console.error("ENV: GITHUB_CLIENT_ID set?", !!process.env.GITHUB_CLIENT_ID);
    console.error(
      "ENV: GITHUB_CLIENT_SECRET set?",
      !!process.env.GITHUB_CLIENT_SECRET,
    );
    throw err;
  }
}
