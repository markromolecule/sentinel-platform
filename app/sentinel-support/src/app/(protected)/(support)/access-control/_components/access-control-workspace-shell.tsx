'use client';

import Link from 'next/link';
import { type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useStableValue } from '@sentinel/hooks';
import { cn } from '@sentinel/ui';

type AccessControlWorkspaceShellProps = {
    children: ReactNode;
};

type WorkspaceItem = {
    href: string;
    label: string;
};

type WorkspaceGroup = {
    label: string;
    items: WorkspaceItem[];
};

const ACCESS_CONTROL_WORKSPACE_GROUPS: WorkspaceGroup[] = [
    {
        label: 'Workspace',
        items: [
            {
                href: '/access-control',
                label: 'Overview',
            },
        ],
    },
    {
        label: 'Configuration',
        items: [
            {
                href: '/access-control/roles',
                label: 'Roles',
            },
            {
                href: '/access-control/permissions',
                label: 'Permissions',
            },
            {
                href: '/access-control/assignments',
                label: 'Assignments',
            },
            {
                href: '/access-control/examination-settings',
                label: 'Exam Settings',
            },
        ],
    },
];

export function AccessControlWorkspaceShell({ children }: AccessControlWorkspaceShellProps) {
    const pathname = usePathname();

    const activeItem = useStableValue(
        () =>
            ACCESS_CONTROL_WORKSPACE_GROUPS.flatMap((group) => group.items).find((item) =>
                item.href === '/access-control'
                    ? pathname === item.href
                    : pathname.startsWith(item.href),
            ) ?? ACCESS_CONTROL_WORKSPACE_GROUPS[0].items[0],
        [pathname],
    );

    return (
        <div className="-m-6 min-h-[calc(100svh-4rem)]">
            <div
                data-lenis-prevent
                className="border-border/60 bg-background border-b px-4 py-2.5 md:px-7 xl:px-8"
            >
                <div className="flex items-center gap-3">
                    <span className="text-muted-foreground hidden text-xs font-medium tracking-[0.18em] uppercase md:inline-flex">
                        Access Control
                    </span>
                    <div className="border-border/60 hidden h-4 border-l md:block" />
                    <div className="min-w-0 flex-1 overflow-x-auto">
                        <WorkspaceNav pathname={pathname} activeLabel={activeItem.label} />
                    </div>
                </div>
            </div>

            <div data-lenis-prevent className="min-w-0 px-4 py-4 md:px-7 md:py-8 xl:px-8 xl:py-8">
                {children}
            </div>
        </div>
    );
}

function WorkspaceNav({ pathname, activeLabel }: { pathname: string; activeLabel: string }) {
    return (
        <nav className="flex min-w-max items-center gap-1">
            {ACCESS_CONTROL_WORKSPACE_GROUPS.flatMap((group) => group.items).map((item) => {
                const isActive =
                    item.href === '/access-control'
                        ? pathname === item.href
                        : pathname.startsWith(item.href);

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                            'inline-flex h-7 items-center rounded-md px-3 text-sm transition-colors',
                            isActive
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-foreground/75 hover:bg-muted/60 hover:text-foreground',
                        )}
                    >
                        {item.label}
                    </Link>
                );
            })}
            <span className="text-muted-foreground ml-2 text-xs md:hidden">{activeLabel}</span>
        </nav>
    );
}
