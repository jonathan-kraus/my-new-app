import { auth } from "@/lib/auth";
import {
  setLastAuthResponseHeaders,
  setLastAuthRequestHeaders,
} from "@/lib/auth-debug";

export const runtime = "nodejs";

export async function GET(req: Request) {
  console.info("Auth handler invoked (GET)", {
    url: req.url,
    method: req.method,
    headers: Object.fromEntries(req.headers.entries()),
  });

  try {
    const reqHeaders = Object.fromEntries(req.headers.entries());
    setLastAuthRequestHeaders(reqHeaders);
    console.info("Auth handler request headers:", reqHeaders);

    const res = await auth.handler(req);

    const headers = Object.fromEntries(res.headers.entries());
    setLastAuthResponseHeaders(headers);
    console.info("Auth handler response headers:", headers);

    return res;
  } catch (err) {
    console.info("Auth handler failed:", err);
    console.info("ENV: DATABASE_URL set?", !!process.env.DATABASE_URL);
    console.info("ENV: GITHUB_CLIENT_ID set?", !!process.env.GITHUB_CLIENT_ID);
    console.inset-ring-muted-foreground(
      "ENV: GITHUB_CLIENT_SECRET set?",
      !!process.env.GITHUB_CLIENT_SECRET,
    );
    throw err;
  }
}

export async function POST(req: Request) {
  console.info("Auth handler invoked (POST)", {
    url: req.url,
    method: req.method,
    headers: Object.fromEntries(req.headers.entries()),
  });

  try {
    const reqHeaders = Object.fromEntries(req.headers.entries());
    setLastAuthRequestHeaders(reqHeaders);
    console.info("Auth handler request headers:", reqHeaders);

    const res = await auth.handler(req);

    const headers = Object.fromEntries(res.headers.entries());
    setLastAuthResponseHeaders(headers);
    console.info("Auth handler response headers:", headers);

    return res;
  } catch (err) {
    console.info("Auth handler failed:", err);
    console.info("ENV: DATABASE_URL set?", !!process.env.DATABASE_URL);
    console.info("ENV: GITHUB_CLIENT_ID set?", !!process.env.GITHUB_CLIENT_ID);
    console.info(
      "ENV: GITHUB_CLIENT_SECRET set?",
      !!process.env.GITHUB_CLIENT_SECRET,
    );
    throw err;
  }
}
