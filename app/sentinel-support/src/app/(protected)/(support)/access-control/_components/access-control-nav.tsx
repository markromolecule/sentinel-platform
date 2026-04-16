'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@sentinel/ui';

const ACCESS_CONTROL_NAV_ITEMS = [
    { href: '/access-control', label: 'Overview' },
    { href: '/access-control/roles', label: 'Roles' },
    { href: '/access-control/permissions', label: 'Permissions' },
    { href: '/access-control/assignments', label: 'Assignments' },
    { href: '/access-control/examination-settings', label: 'Exam Settings' },
];

export function AccessControlNav() {
    const pathname = usePathname();

    return (
        <nav className="overflow-x-auto">
            <div className="bg-background inline-flex min-w-full items-center gap-2 rounded-xl border p-1">
                {ACCESS_CONTROL_NAV_ITEMS.map((item) => {
                    const isActive =
                        item.href === '/access-control'
                            ? pathname === item.href
                            : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                            )}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
