import { NextResponse } from "next/server";

interface ClientAccount {
  email: string;
  password: string;
}

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const sessionHours = parseInt(process.env.CLIENT_SESSION_HOURS ?? "4", 10);

  let role: "admin" | "client" | null = null;
  let expiresAt: number | null = null;

  if (email === adminEmail && password === adminPassword) {
    role = "admin";
    expiresAt = null;
  } else {
    let clients: ClientAccount[] = [];
    try {
      clients = JSON.parse(process.env.CLIENT_ACCOUNTS ?? "[]");
    } catch {
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    const match = clients.find(
      (c) => c.email === email && c.password === password
    );
    if (match) {
      role = "client";
      expiresAt = Date.now() + sessionHours * 60 * 60 * 1000;
    }
  }

  if (!role) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const sessionValue = JSON.stringify({ role, expiresAt });
  // maxAge = cookie browser TTL; expiresAt in payload = what middleware checks at runtime.
  // Admin has no expiresAt (unlimited), so maxAge is the only expiry mechanism for them.
  const maxAge = role === "admin" ? 60 * 60 * 24 * 30 : sessionHours * 60 * 60;

  const response = NextResponse.json({ success: true, role });
  response.cookies.set("auth_session", sessionValue, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge,
  });

  return response;
}
