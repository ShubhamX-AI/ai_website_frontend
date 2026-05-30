import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/login" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Public embed surface — third-party sites load these without an auth cookie.
  // `/widget.js` is the loader script; `/embed` is the widget it iframes in.
  if (pathname === "/widget.js" || pathname === "/embed" || pathname.startsWith("/embed/")) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get("auth_session");

  if (!cookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const session = JSON.parse(cookie.value) as {
      role: string;
      expiresAt: number | null;
    };

    if (session.expiresAt !== null && Date.now() > session.expiresAt) {
      const response = NextResponse.redirect(
        new URL("/login?expired=true", request.url)
      );
      response.cookies.delete("auth_session");
      return response;
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.ico$).*)",
  ],
};
