'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
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

export interface NavItem {
    title: string;
    url: string;
    icon: React.ElementType;
    children?: {
        title: string;
        url: string;
        icon?: React.ElementType;
    }[];
}

interface InstructorSidebarItemProps {
    item: NavItem;
    pathname: string;
    isActive?: boolean;
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
    isChildActive?: (url: string) => boolean;
    sidebarState: 'expanded' | 'collapsed';
    unreadCount?: number;
}

export function InstructorSidebarItem({
    item,
    pathname,
    isActive,
    isOpen,
    setIsOpen,
    isChildActive,
    sidebarState,
    unreadCount,
}: InstructorSidebarItemProps) {
    if (item.children?.length) {
        return (
            <Collapsible
                key={item.title}
                open={isOpen}
                onOpenChange={setIsOpen}
                className="group/collapsible"
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
                                    isOpen && 'rotate-90',
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
                        {item.children.map((child) => (
                            <SidebarMenuSubItem key={child.title}>
                                <SidebarMenuSubButton
                                    asChild
                                    size="sm"
                                    isActive={isChildActive?.(child.url)}
                                    className="text-muted-foreground h-8 pl-6 group-data-[collapsible=icon]:justify-start group-data-[collapsible=icon]:pl-6"
                                >
                                    <Link href={child.url}>
                                        <span
                                            className={cn(
                                                'bg-muted-foreground/30 mr-2.5 h-1.5 w-1.5 shrink-0 rounded-full transition-all',
                                                isChildActive?.(child.url) &&
                                                    'bg-primary scale-110',
                                            )}
                                        />
                                        <span
                                            className={cn(
                                                'text-xs font-normal transition-colors',
                                                isChildActive?.(child.url)
                                                    ? 'text-foreground font-medium'
                                                    : 'text-muted-foreground/70',
                                            )}
                                        >
                                            {child.title}
                                        </span>
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
                isActive={pathname === item.url}
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
                        'pointer-events-none absolute rounded-full bg-destructive text-white font-semibold flex items-center justify-center shadow-xs transition-all duration-300 select-none animate-in zoom-in-50 duration-200',
                        sidebarState === 'collapsed'
                            ? 'top-0.5 right-0.5 h-4 w-4 text-[9px]'
                            : 'top-1/2 -translate-y-1/2 right-3 h-5 min-w-[20px] px-1.5 text-[10px]',
                    )}
                >
                    {unreadCount}
                </span>
            )}
        </SidebarMenuItem>
    );
}
