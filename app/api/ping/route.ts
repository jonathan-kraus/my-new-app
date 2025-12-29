// app/api/ping/route.ts - SIMPLE TEST
export async function GET() {
  return Response.json({ message: "API works!" });
}
