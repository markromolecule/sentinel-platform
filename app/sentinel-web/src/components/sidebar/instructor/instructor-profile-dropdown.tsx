"use client";

import { useTheme } from "next-themes";
import {
    Settings,
    Sun,
    Moon,
    Monitor,
    LogOut,
    Check
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@sentinel/ui";
import { MOCK_PROCTOR } from "@sentinel/shared/constants";
import { useInstructorNav } from "./hooks/use-instructor-nav";

export function InstructorProfileDropdown() {
    const { theme, setTheme } = useTheme();
    const { handleLogout } = useInstructorNav();

    const themeOptions = [
        { name: "Light", value: "light", icon: Sun },
        { name: "Dark", value: "dark", icon: Moon },
        { name: "System", value: "system", icon: Monitor },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity shadow-sm">
                    {MOCK_PROCTOR.firstName[0]}{MOCK_PROCTOR.lastName[0]}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1 mt-2">
                <DropdownMenuLabel className="p-2 font-normal">
                    <div className="flex flex-col space-y-0.5">
                        <p className="text-sm font-semibold leading-none">{MOCK_PROCTOR.firstName} {MOCK_PROCTOR.lastName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{MOCK_PROCTOR.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />

                <div className="space-y-0.5">
                    <DropdownMenuItem className="cursor-pointer gap-2 py-1.5">
                        <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">Account preferences</span>
                    </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="my-1" />

                <div className="px-2 py-1.5">
                    <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">Theme</p>
                    <div className="space-y-0.5">
                        {themeOptions.map((opt) => (
                            <DropdownMenuItem
                                key={opt.value}
                                className="cursor-pointer justify-between py-1.5 px-2 focus:bg-accent"
                                onClick={() => setTheme(opt.value)}
                            >
                                <div className="flex items-center gap-2">
                                    <opt.icon className="h-3.5 w-3.5" />
                                    <span className="text-sm">{opt.name}</span>
                                </div>
                                {theme === opt.value && (
                                    <Check className="h-3 w-3 text-primary" />
                                )}
                            </DropdownMenuItem>
                        ))}
                    </div>
                </div>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem
                    className="text-foreground focus:text-foreground focus:bg-accent cursor-pointer py-1.5 px-2"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-2 h-3.5 w-3.5" />
                    <span className="text-sm">Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function InstructorProfileDropdownFallback() {
    return (
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold animate-pulse cursor-pointer shadow-sm" />
    );
}
