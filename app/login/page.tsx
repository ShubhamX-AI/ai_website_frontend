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
