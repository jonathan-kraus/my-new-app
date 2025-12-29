// app/api/ping/route.ts - SIMPLE TEST
export async function GET() {
  appLog({ level: "info", message: "ping", page: "init" });
  return Response.json({ message: "API works!" });
}
