/*
 * @FilePath: \my-new-app\app\api\version\route.ts
 * @LastEditTime: 2026-07-21 16:19:32
 */
import pkg from "../../../package.json";

export async function GET() {
  return Response.json({
    version: pkg.version,
    name: pkg.name,
  });
}
