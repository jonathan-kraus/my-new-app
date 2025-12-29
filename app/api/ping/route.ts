// app/api/ping/route.ts - SIMPLE TEST
import { appLog } from "@/lib/logger";
export async function GET() {
  appLog({ level: "info", message: "ping", page: "init" });
  return Response.json({ message: "API works!" });
}
