"use client";

/**
 * CTAButton — the rounded pill call-to-action used on the landing page.
 *
 * One place for the button styling so adding another CTA is just one more
 * <CTAButton /> with a different href/label/icon — no copy-pasted Tailwind.
 *
 *   variant="primary"   solid blue (the main action)
 *   variant="secondary" white with blue ring + soft glow (e.g. "Try Vani Today")
 */

import Link from "next/link";
import type { ReactNode } from "react";

interface CTAButtonProps {
    href: string;
    label: string;
    icon: ReactNode;
    variant?: "primary" | "secondary";
}

export function CTAButton({ href, label, icon, variant = "primary" }: CTAButtonProps) {
    const isPrimary = variant === "primary";

    return (
        <Link href={href} className="group relative inline-flex">
            <div
                className={`relative flex h-14 items-center justify-center gap-3 overflow-hidden rounded-full px-10 text-base font-medium transition-transform duration-300 active:scale-95 ${
                    isPrimary
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 group-hover:bg-blue-700"
                        : "bg-white text-blue-700 shadow-sm ring-1 ring-blue-200 group-hover:ring-blue-400"
                }`}
            >
                <span>{label}</span>
                {icon}

                {/* Shine sweep — primary only */}
                {isPrimary && (
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
                )}
            </div>

            {/* Soft glow behind the pill */}
            <div
                className={`absolute top-2 left-4 right-4 -z-10 h-full rounded-full blur-xl transition-opacity duration-500 ${
                    isPrimary
                        ? "bg-blue-600/30 group-hover:opacity-50"
                        : "bg-blue-400/20 opacity-0 group-hover:opacity-100"
                }`}
            />
        </Link>
    );
}
