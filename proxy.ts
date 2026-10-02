import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Edge guard in front of the application.
 *
 * It only answers one question: is there a valid Supabase session for this
 * request. Role checks stay on the server inside the route handlers and server
 * components, because hiding a UI control is never the authorisation itself.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const PROTECTED_PAGES = [
  "/dashboard",
  "/matches",
  "/athletes",
  "/tournaments",
  "/arenas",
  "/judges",
  "/reports",
  "/settings",
  "/live-scoring",
  "/judge",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PAGES.some(
    (page) => pathname === page || pathname.startsWith(`${page}/`)
  );
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const needsSession = isProtectedPath(pathname) || pathname === "/login";

  if (!needsSession) {
    return response;
  }

  if (!supabaseUrl || !supabasePublishableKey) {
    if (isProtectedPath(pathname)) {
      return NextResponse.redirect(new URL("/login?reason=auth-unconfigured", request.url));
    }
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtectedPath(pathname) && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/matches/:path*",
    "/athletes/:path*",
    "/tournaments/:path*",
    "/arenas/:path*",
    "/judges/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/live-scoring/:path*",
    "/judge/:path*",
    "/login",
  ],
};