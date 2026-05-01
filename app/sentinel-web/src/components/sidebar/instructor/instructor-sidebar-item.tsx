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
    isChildActive: (url: string) => boolean;
    sidebarState: 'expanded' | 'collapsed';
}

export function InstructorSidebarItem({
    item,
    pathname,
    isActive,
    isOpen,
    setIsOpen,
    isChildActive,
    sidebarState,
}: InstructorSidebarItemProps) {
    if (item.children) {
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
                    <SidebarMenuSub className={cn(sidebarState === 'collapsed' && 'hidden')}>
                        {item.children.map((child) => (
                            <SidebarMenuSubItem key={child.title}>
                                <SidebarMenuSubButton asChild isActive={isChildActive(child.url)}>
                                    <Link href={child.url}>
                                        {child.icon ? (
                                            <child.icon className="text-muted-foreground/70 h-3.5 w-3.5" />
                                        ) : (
                                            <span className="bg-muted-foreground/60 h-1.5 w-1.5 rounded-full" />
                                        )}
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
        <SidebarMenuItem key={item.title}>
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
        </SidebarMenuItem>
    );
}
