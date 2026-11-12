/*
 * @FilePath: \my-new-app\app\api\set-flight-id\route.ts
 * @LastEditTime: 2026-03-11 20:03:41
 */
import { NextResponse } from "next/server";
import { withRequestTiming } from "@/lib/log/with-request-timing";
import { RuntimeAccessError, requireRuntimeAdmin } from "@/lib/runtime/admin";
import { setConfig } from "@/lib/runtime/config"; // your existing config helper
import { runtimeSettingSchema } from "@/lib/runtime/validation";

async function POSTHandler(req: Request) {
  try {
    await requireRuntimeAdmin();
  } catch (error) {
    if (error instanceof RuntimeAccessError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    throw error;
  }

  const body: unknown = await req.json().catch(() => null);
  const ident =
    body && typeof body === "object" && "ident" in body
      ? body.ident
      : undefined;
  const parsed = runtimeSettingSchema.safeParse({
    key: "flight-ID",
    value: ident,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid flight identifier." },
      { status: 400 },
    );
  }

  await setConfig("flight-ID", parsed.data.value);

  return NextResponse.json({ success: true });
}

export const POST = withRequestTiming("POST", "/set-flight-id", POSTHandler);
