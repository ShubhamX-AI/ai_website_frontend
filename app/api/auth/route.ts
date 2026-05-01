import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const backendUrl = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL;

  try {
    const res = await fetch(`${backendUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.status === 403) {
      return NextResponse.json(
        { error: "Your access has expired. Contact admin." },
        { status: 403 }
      );
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.detail ?? "Invalid credentials" },
        { status: res.status }
      );
    }

    const data = await res.json() as {
      token: string;
      role: "admin" | "client";
      expires_at: number | null;
    };

    const sessionValue = JSON.stringify({
      role: data.role,
      expiresAt: data.expires_at ?? null,
      token: data.token,
    });

    const maxAge =
      data.role === "admin"
        ? 60 * 60 * 24 * 30
        : Math.floor(((data.expires_at ?? Date.now() + 4 * 3600 * 1000) - Date.now()) / 1000);

    const response = NextResponse.json({ success: true, role: data.role });
    response.cookies.set("auth_session", sessionValue, {
      httpOnly: true,
      sameSite: "strict",
      path: "/",
      maxAge,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Auth service unavailable" }, { status: 503 });
  }
}
