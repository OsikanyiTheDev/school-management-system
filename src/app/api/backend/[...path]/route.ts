import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIES, getBackendApiUrl } from "@/lib/auth";

export const runtime = "nodejs";

const ALLOWED_PATHS = [
  /^schools$/,
  /^schools\/[A-Za-z0-9_-]+$/,
  /^schools\/[A-Za-z0-9_-]+\/(academic-years|terms|classes|subjects|students|teachers|guardians|teacher-assignments)$/,
];

const METHOD_RULES: Record<string, RegExp[]> = {
  GET: [/^schools\/[A-Za-z0-9_-]+$/],
  POST: [
    /^schools$/,
    /^schools\/[A-Za-z0-9_-]+\/(academic-years|terms|classes|subjects|students|teachers|guardians|teacher-assignments)$/,
  ],
};

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const apiUrl = getBackendApiUrl();
  if (!apiUrl) return NextResponse.json({ error: "backend_not_configured" }, { status: 503 });

  const segments = (await context.params).path;
  const path = segments.join("/");
  const pathAllowed = ALLOWED_PATHS.some((pattern) => pattern.test(path));
  const methodAllowed = METHOD_RULES[request.method]?.some((pattern) => pattern.test(path));
  if (!pathAllowed || !methodAllowed) {
    return NextResponse.json({ error: "route_not_allowed" }, { status: 404 });
  }

  const cookieStore = await cookies();
  const idToken = cookieStore.get(AUTH_COOKIES.id)?.value;
  const accessToken = cookieStore.get(AUTH_COOKIES.access)?.value;
  const forwardedToken = idToken ?? accessToken;
  if (!forwardedToken) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const target = new URL(`${apiUrl}/${path}`);
  request.nextUrl.searchParams.forEach((value, key) => target.searchParams.append(key, value));
  const body = request.method === "GET" ? undefined : await request.text();

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers: {
        authorization: `Bearer ${forwardedToken}`,
        ...(body ? { "content-type": request.headers.get("content-type") ?? "application/json" } : {}),
      },
      body,
      cache: "no-store",
    });
    return new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    return NextResponse.json({ error: "backend_unavailable" }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
