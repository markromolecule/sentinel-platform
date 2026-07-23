'use client';

import Link from 'next/link';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { cn } from '@sentinel/ui';
import {
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuAction,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from '@sentinel/ui';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@sentinel/ui';

export interface SidebarNavItem {
    title: string;
    url: string;
    icon: LucideIcon;
    subItems?: {
        title: string;
        url: string;
    }[];
}

interface DashboardSidebarItemProps {
    item: SidebarNavItem;
    pathname: string;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    isChildActive: (url: string) => boolean;
    sidebarState: 'expanded' | 'collapsed';
    unreadCount?: number;
}

export function DashboardSidebarItem({
    item,
    pathname,
    isOpen,
    onOpenChange,
    isChildActive,
    sidebarState,
    unreadCount,
}: DashboardSidebarItemProps) {
    const isItemActive = pathname === item.url || pathname.startsWith(`${item.url}/`);

    if (item.subItems) {
        const isActive = isItemActive || item.subItems.some((sub) => isChildActive(sub.url));

        return (
            <Collapsible
                key={item.title}
                open={isOpen ?? true}
                onOpenChange={onOpenChange}
                className="group/collapsible"
                defaultOpen={isActive}
            >
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className="group-data-[collapsible=icon]:justify-start"
                    >
                        <Link href={item.url}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                        </Link>
                    </SidebarMenuButton>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuAction className="group-data-[collapsible=icon]:hidden">
                            <ChevronRight
                                className={cn(
                                    'h-4 w-4 transition-transform',
                                    (isOpen ?? true) && 'rotate-90',
                                )}
                            />
                        </SidebarMenuAction>
                    </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent>
                    <SidebarMenuSub
                        className={cn(
                            'border-border/40 mt-1 ml-5 border-l pl-2',
                            sidebarState === 'collapsed' && 'hidden',
                        )}
                    >
                        {item.subItems.map((child) => (
                            <SidebarMenuSubItem key={child.title}>
                                <SidebarMenuSubButton
                                    asChild
                                    size="sm"
                                    isActive={isChildActive(child.url)}
                                    className="text-muted-foreground h-8 pl-6 group-data-[collapsible=icon]:justify-start group-data-[collapsible=icon]:pl-6"
                                >
                                    <Link href={child.url}>
                                        <span
                                            className={cn(
                                                'bg-muted-foreground/40 mr-2 h-1.5 w-1.5 shrink-0 rounded-full',
                                                isChildActive(child.url) && 'bg-primary',
                                            )}
                                        />
                                        <span>{child.title}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>
        );
    }

    return (
        <SidebarMenuItem key={item.title} className="relative">
            <SidebarMenuButton
                asChild
                isActive={isItemActive}
                tooltip={item.title}
                className="group-data-[collapsible=icon]:justify-start"
            >
                <Link href={item.url}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                </Link>
            </SidebarMenuButton>
            {item.url === '/messages' && unreadCount !== undefined && unreadCount > 0 && (
                <span
                    className={cn(
                        'bg-destructive animate-in zoom-in-50 pointer-events-none absolute flex items-center justify-center rounded-full font-semibold text-white shadow-xs transition-all duration-200 duration-300 select-none',
                        sidebarState === 'collapsed'
                            ? 'top-0.5 right-0.5 h-4 w-4 text-[9px]'
                            : 'top-1/2 right-3 h-5 min-w-[20px] -translate-y-1/2 px-1.5 text-[10px]',
                    )}
                >
                    {unreadCount}
                </span>
            )}
        </SidebarMenuItem>
    );
}
