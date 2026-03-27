import { NextResponse, type NextRequest } from "next/server";

import { verifySessionPayloadEdge } from "@/lib/auth/session-verify-edge";

const SESSION_COOKIE_NAME = "franklin_session";

// ---------------------------------------------------------------------------
// Structured audit log (edge-compatible — no node:crypto)
// ---------------------------------------------------------------------------

function auditLog(entry: Record<string, string | number | boolean | undefined>) {
  console.log(JSON.stringify({ ...entry, timestamp: new Date().toISOString() }));
}

// ---------------------------------------------------------------------------
// In-memory rate limiter for edge runtime (public routes)
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
let lastCleanup = Date.now();

function checkEdgeRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();

  if (now - lastCleanup > 60_000) {
    lastCleanup = now;
    for (const [k, v] of rateLimitMap) {
      if (v.resetAt <= now) rateLimitMap.delete(k);
    }
  }

  const entry = rateLimitMap.get(key);

  if (!entry || entry.resetAt <= now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/app")) {
    return handleWorkspaceAuth(request);
  }

  if (pathname.startsWith("/p/")) {
    return handlePublicRateLimit(request);
  }

  return NextResponse.next();
}

// ---------------------------------------------------------------------------
// Workspace auth enforcement
// ---------------------------------------------------------------------------

async function handleWorkspaceAuth(request: NextRequest): Promise<NextResponse> {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const ip = getClientIp(request);
  const route = request.nextUrl.pathname;

  if (!sessionCookie) {
    auditLog({
      event: "middleware.auth.rejected",
      outcome: "denied",
      reasonCode: "NO_SESSION",
      ip,
      route
    });
    return redirectToLogin(request);
  }

  const payload = await verifySessionPayloadEdge(sessionCookie);

  if (!payload) {
    auditLog({
      event: "middleware.auth.rejected",
      outcome: "denied",
      reasonCode: "INVALID_SIGNATURE",
      ip,
      route
    });
    const response = redirectToLogin(request);
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  try {
    const parsed = JSON.parse(payload);
    if (
      !parsed?.user?.id ||
      !parsed?.user?.role ||
      !["ADMIN", "PARTNER"].includes(parsed.user.role)
    ) {
      auditLog({
        event: "middleware.auth.rejected",
        outcome: "denied",
        reasonCode: "INVALID_ROLE",
        ip,
        route,
        role: parsed?.user?.role
      });
      const response = redirectToLogin(request);
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }
  } catch {
    auditLog({
      event: "middleware.auth.rejected",
      outcome: "denied",
      reasonCode: "MALFORMED_SESSION",
      ip,
      route
    });
    const response = redirectToLogin(request);
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL("/login", request.url));
}

// ---------------------------------------------------------------------------
// Public route rate limiting
// ---------------------------------------------------------------------------

function handlePublicRateLimit(request: NextRequest): NextResponse {
  const ip = getClientIp(request);
  const allowed = checkEdgeRateLimit(`public-read:${ip}`, 60, 60_000);

  if (!allowed) {
    auditLog({
      event: "middleware.ratelimit.exceeded",
      outcome: "blocked",
      ip,
      route: request.nextUrl.pathname
    });
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: { "Retry-After": "60", "Content-Type": "text/plain" }
    });
  }

  return NextResponse.next();
}

// ---------------------------------------------------------------------------
// Matcher
// ---------------------------------------------------------------------------

export const config = {
  matcher: ["/app/:path*", "/p/:path*"]
};
