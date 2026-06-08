'use client';

import { useState, useEffect } from 'react';

/**
 * Returns a time-sensitive greeting string based on the current hour of the day.
 *
 * - 00:00–11:59 → "Good morning"
 * - 12:00–17:59 → "Good afternoon"
 * - 18:00–23:59 → "Good evening"
 */
export function getTimeOfDayGreeting(): 'Good morning' | 'Good afternoon' | 'Good evening' {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
}

/**
 * Formats a raw user name or email into a clean display name.
 * Extracts the user's last name (last word in the name string).
 * e.g., "support@sentinelph.tech" -> "Support"
 * e.g., "jake.harper" -> "Harper"
 * e.g., "Joseph Cruz" -> "Cruz"
 */
export function formatDisplayName(name: string): string {
    const part = name.includes('@') ? name.split('@')[0] : name;
    const cleanName = part.split(/[\._-]/).join(' ').trim();
    const words = cleanName.split(/\s+/).filter(Boolean);
    if (words.length === 0) return 'User';
    const lastName = words[words.length - 1];
    return lastName.charAt(0).toUpperCase() + lastName.slice(1);
}

interface DashboardGreetingProps {
    /** The display name of the currently logged-in user. */
    fullName: string;
}

/**
 * Renders a personalized greeting section at the top of the support dashboard.
 * Shows a time-of-day salutation, the user's full name, today's formatted date/time,
 * and a contextual sub-text to orient the user.
 *
 * @param props.fullName - The full name (or fallback) of the authenticated user.
 */
export function DashboardGreeting({ fullName }: DashboardGreetingProps) {
    const displayName = formatDisplayName(fullName);

    const [greeting, setGreeting] = useState<string>('');
    const [dateTimeString, setDateTimeString] = useState<string>('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        const updateGreetingAndDateTime = () => {
            const dateStr = new Intl.DateTimeFormat('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }).format(new Date());

            const timeStr = new Date().toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });

            setDateTimeString(`${dateStr} • ${timeStr}`);

            const hour = new Date().getHours();
            let currentGreeting = 'Good evening';
            if (hour < 12) {
                currentGreeting = 'Good morning';
            } else if (hour < 18) {
                currentGreeting = 'Good afternoon';
            }
            setGreeting(currentGreeting);
        };

        updateGreetingAndDateTime();

        const interval = setInterval(() => {
            updateGreetingAndDateTime();
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2">
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-primary tracking-tight">
                    {mounted ? `${greeting}, ${displayName}!` : 'Loading...'}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                    Lets check what&apos;s happening today
                </p>
            </div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 border rounded-full px-4 py-1.5 shadow-xs shrink-0 self-start sm:self-auto min-h-[32px] flex items-center justify-center">
                {mounted ? dateTimeString : 'Loading...'}
            </div>
        </div>
    );
}
