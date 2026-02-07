"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LiveKitRoom } from "@livekit/components-react";
import { useLiveKitConnection } from "../hooks/useLiveKitConnection";
import { AgentInterface } from "./_components/AgentInterface";

const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL || "";

export default function DynamicPage() {
  const router = useRouter();
  const { token, error, connect, disconnect } = useLiveKitConnection();

  const handleDisconnect = () => {
    disconnect();
    router.push("/landing");
  };

  useEffect(() => {
    // Auto-connect on land
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#FAFAFA] text-zinc-900">
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <h3 className="text-xl font-semibold text-red-500">Connection Failed</h3>
          <p className="mt-2 text-zinc-400">{error.message}</p>
          <button
            onClick={() => connect()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-500"
          >
            Retry
          </button>
          <Link href="/landing" className="mt-4 block text-sm text-zinc-500 hover:text-zinc-300">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full flex-col bg-[#FAFAFA] overflow-hidden font-sans text-zinc-900 selection:bg-blue-100 selection:text-blue-900">

      {/* Background Ambience (Light Theme) */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-[20%] left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(219,234,254,0.4)_0%,rgba(255,255,255,0)_70%)] blur-3xl opacity-60"></div>
        <div className="absolute top-[40%] -right-[10%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(224,231,255,0.3)_0%,rgba(255,255,255,0)_70%)] blur-3xl opacity-50"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex h-[100dvh] w-full flex-col p-3 pt-6 md:p-6 lg:p-8">

        {/* Navigation / Header */}
        <header className="mb-4 flex items-center justify-between sm:mb-6">
          <div className="flex items-center gap-2">
            <Link href="/landing" className="group flex items-center gap-2 rounded-full bg-zinc-100 py-2 pl-3 pr-4 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900 sm:text-sm">
              <svg className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center">
          {!token ? (
            <div className="flex flex-col items-center gap-8 text-center">
              <div className="relative flex h-24 w-24 items-center justify-center">
                <div className="absolute inset-0 animate-ping rounded-full bg-blue-100 opacity-75"></div>
                <div className="relative h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                  <svg className="h-6 w-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                  Initializing Agent
                </h1>
                <p className="mt-2 text-zinc-500">
                  Connecting to secure session...
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full w-full overflow-hidden rounded-3xl transition-opacity duration-1000">
              <LiveKitRoom
                token={token}
                serverUrl={LIVEKIT_URL}
                connect={true}
                video={false}
                audio={{
                  echoCancellation: true,
                  noiseSuppression: true,
                  autoGainControl: true,
                }}
                data-lk-theme="default"
                style={{ height: '100%' }}
                onDisconnected={handleDisconnect}
                onError={(err) => console.error("LiveKit Room Error:", err)}
              >
                <AgentInterface onDisconnect={handleDisconnect} />
              </LiveKitRoom>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
