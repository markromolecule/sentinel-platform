"use client";

import { cn } from "@sentinel/ui";
import { ReactNode } from "react";

interface PageShellProps {
    children: ReactNode;
    className?: string;
    container?: boolean;
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const MAX_WIDTH_MAP = {
    sm: "max-w-3xl",
    md: "max-w-4xl",
    lg: "max-w-5xl",
    xl: "max-w-6xl",
    "2xl": "max-w-7xl",
    full: "max-w-full",
};

/**
 * Standardized wrapper for page content to ensure consistent padding and layout.
 */
export function PageShell({
    children,
    className,
    container = true,
    maxWidth = "2xl",
}: PageShellProps) {
    return (
        <div
            className={cn(
                "flex flex-col gap-6 w-full animate-in fade-in duration-500",
                container && "mx-auto px-4 sm:px-6 md:p-6",
                container && MAX_WIDTH_MAP[maxWidth],
                className
            )}
        >
            {children}
        </div>
    );
}
