"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const expired = params.get("expired") === "true";
  const loggedOut = params.get("logout") === "true";
  const oauthFailed = params.get("error") === "oauth_failed";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push("/landing");
      } else {
        const data = await res.json();
        setError(data.error ?? "Invalid credentials");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-slate-50 text-slate-900">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-40">
        <div className="absolute top-0 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(219,234,254,0.5)_0%,rgba(255,255,255,0)_70%)] blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-[600px] w-[600px] translate-x-1/4 translate-y-1/4 rounded-full bg-[radial-gradient(circle,rgba(224,242,254,0.3)_0%,rgba(255,255,255,0)_70%)] blur-[80px]" />
      </div>

      <main className="relative z-10 flex w-full max-w-sm flex-col items-center gap-8 px-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-[0_4px_24px_-4px_rgba(37,99,235,0.08)] ring-1 ring-slate-900/[0.03]"
        >
          <Image
            src="/int-logo.svg"
            alt="Indusnet Technologies"
            width={40}
            height={40}
            priority
            className="h-auto w-full object-contain p-2 opacity-90"
          />
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Indus Net <span className="text-blue-600">Technologies</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to continue</p>
        </motion.div>

        {/* Status banners */}
        {expired && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 ring-1 ring-amber-200"
          >
            Session expired. Contact us to regain access.
          </motion.div>
        )}
        {loggedOut && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200"
          >
            You have been logged out.
          </motion.div>
        )}
        {oauthFailed && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200"
          >
            Google sign-in failed. Please try again or use email/password.
          </motion.div>
        )}

        {/* Google SSO */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          <a
            href="/api/auth/google"
            className="flex w-full items-center justify-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow active:scale-95"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path
                d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                fill="#4285F4"
              />
              <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </a>
        </motion.div>

        {/* Divider */}
        <div className="flex w-full items-center gap-3">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-[11px] uppercase tracking-widest text-slate-400">or</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex w-full flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium tracking-wide text-slate-500 uppercase">
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none ring-0 transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium tracking-wide text-slate-500 uppercase">
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none ring-0 transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative mt-2 flex h-12 w-full items-center justify-center overflow-hidden rounded-full bg-blue-600 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:bg-blue-700 active:scale-95 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="flex items-center gap-4"
        >
          <span className="h-px w-10 bg-slate-200" />
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">
            Secure Access
          </p>
          <span className="h-px w-10 bg-slate-200" />
        </motion.div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
