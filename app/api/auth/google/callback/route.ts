import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const role = url.searchParams.get("role") as "admin" | "client" | null;
  const expiresAt = url.searchParams.get("expires_at");

  if (!token || !role) {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
  }

  const expiresAtMs =
    expiresAt && expiresAt !== "" ? parseInt(expiresAt, 10) : null;

  const sessionValue = JSON.stringify({
    role,
    expiresAt: expiresAtMs,
    token,
  });

  const maxAge =
    role === "admin"
      ? 60 * 60 * 24 * 30
      : expiresAtMs
      ? Math.floor((expiresAtMs - Date.now()) / 1000)
      : 4 * 60 * 60;

  const response = NextResponse.redirect(new URL("/landing", request.url));
  response.cookies.set("auth_session", sessionValue, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge,
  });

  return response;
}
