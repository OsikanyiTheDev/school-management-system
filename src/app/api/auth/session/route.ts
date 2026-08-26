import { NextResponse } from "next/server";
import { getAuthConfig, getSession } from "@/lib/auth";

export async function GET() {
  const config = getAuthConfig();
  const session = await getSession();
  return NextResponse.json({
    configured: Boolean(config),
    authenticated: Boolean(session),
    session,
  });
}
