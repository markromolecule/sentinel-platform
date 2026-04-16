'use client';

import { useTheme } from 'next-themes';
import { Settings, Sun, Moon, Monitor, LogOut, Check } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@sentinel/ui';
import { MOCK_PROCTOR } from '@sentinel/shared/constants';
import { useInstructorNav } from './hooks/use-instructor-nav';

export function InstructorProfileDropdown() {
    const { theme, setTheme } = useTheme();
    const { handleLogout } = useInstructorNav();

    const themeOptions = [
        { name: 'Light', value: 'light', icon: Sun },
        { name: 'Dark', value: 'dark', icon: Moon },
        { name: 'System', value: 'system', icon: Monitor },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="bg-primary text-primary-foreground flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-xs font-bold shadow-sm transition-opacity hover:opacity-90">
                    {MOCK_PROCTOR.firstName[0]}
                    {MOCK_PROCTOR.lastName[0]}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="mt-2 w-56 p-1">
                <DropdownMenuLabel className="p-2 font-normal">
                    <div className="flex flex-col space-y-0.5">
                        <p className="text-sm leading-none font-semibold">
                            {MOCK_PROCTOR.firstName} {MOCK_PROCTOR.lastName}
                        </p>
                        <p className="text-muted-foreground text-xs leading-none">
                            {MOCK_PROCTOR.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />

                <div className="space-y-0.5">
                    <DropdownMenuItem className="cursor-pointer gap-2 py-1.5">
                        <Settings className="text-muted-foreground h-3.5 w-3.5" />
                        <span className="text-sm">Account preferences</span>
                    </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="my-1" />

                <div className="px-2 py-1.5">
                    <p className="text-muted-foreground mb-2 px-2 text-xs font-semibold">Theme</p>
                    <div className="space-y-0.5">
                        {themeOptions.map((opt) => (
                            <DropdownMenuItem
                                key={opt.value}
                                className="focus:bg-accent cursor-pointer justify-between px-2 py-1.5"
                                onClick={() => setTheme(opt.value)}
                            >
                                <div className="flex items-center gap-2">
                                    <opt.icon className="h-3.5 w-3.5" />
                                    <span className="text-sm">{opt.name}</span>
                                </div>
                                {theme === opt.value && <Check className="text-primary h-3 w-3" />}
                            </DropdownMenuItem>
                        ))}
                    </div>
                </div>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem
                    className="text-foreground focus:text-foreground focus:bg-accent cursor-pointer px-2 py-1.5"
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
        <div className="bg-primary text-primary-foreground flex h-8 w-8 animate-pulse cursor-pointer items-center justify-center rounded-full text-xs font-bold shadow-sm" />
    );
}
