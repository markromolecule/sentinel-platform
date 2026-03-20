"use client";

import NextImage from "next/image";
import { Menu } from "lucide-react";
import { SidebarTrigger } from "@sentinel/ui";
import dynamic from "next/dynamic";
import { InstructorProfileDropdownFallback } from "@/components/sidebar/instructor/instructor-profile-dropdown";

const InstructorProfileDropdown = dynamic(
    () => import("@/components/sidebar/instructor/instructor-profile-dropdown").then(mod => mod.InstructorProfileDropdown),
    {
        ssr: false,
        loading: () => <InstructorProfileDropdownFallback />
    }
);

export function InstructorHeader() {
    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/40 px-4 md:px-6 bg-background/80 backdrop-blur-md sticky top-0 z-50 w-full">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden">
                    <Menu className="h-5 w-5" />
                </SidebarTrigger>
                <div className="flex items-center gap-4">
                    <div className="relative h-8 w-32">
                        <NextImage
                            src="/icons/light-sentinel-logo.svg"
                            alt="Sentinel Logo"
                            fill
                            className="object-contain dark:hidden"
                            priority
                        />
                        <NextImage
                            src="/icons/dark-sentinel-logo.svg"
                            alt="Sentinel Logo"
                            fill
                            className="object-contain hidden dark:block"
                            priority
                        />
                    </div>
                    <div className="h-6 w-px bg-border hidden md:block" />
                    <span className="text-sm font-medium text-muted-foreground whitespace-nowrap hidden md:block">
                        NU Dasmariñas
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <InstructorProfileDropdown />
            </div>
        </header>
    );
}
