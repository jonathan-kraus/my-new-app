/*
 * @FilePath: \my-new-app\app\api\set-flight-id\route.ts
 * @LastEditTime: 2026-03-11 20:03:41
 */
import { NextResponse } from "next/server";
import { setConfig } from "@/lib/runtime/config"; // your existing config helper
import { requireRuntimeAdmin, RuntimeAccessError } from "@/lib/runtime/admin";
import { runtimeSettingSchema } from "@/lib/runtime/validation";

export async function POST(req: Request) {
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
