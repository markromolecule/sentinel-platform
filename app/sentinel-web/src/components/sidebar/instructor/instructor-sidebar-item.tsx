'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@sentinel/ui';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuAction } from '@sentinel/ui';
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
    isExamActive?: boolean;
    isExamMenuOpen?: boolean;
    setIsExamMenuOpen?: (open: boolean) => void;
    isChildActive: (url: string) => boolean;
    sidebarState: 'expanded' | 'collapsed';
}

export function InstructorSidebarItem({
    item,
    pathname,
    isExamActive,
    isExamMenuOpen,
    setIsExamMenuOpen,
    isChildActive,
    sidebarState,
}: InstructorSidebarItemProps) {
    if (item.children) {
        return (
            <Collapsible
                key={item.title}
                open={isExamMenuOpen}
                onOpenChange={setIsExamMenuOpen}
                className="group/collapsible"
            >
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={isExamActive}
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
                                    isExamMenuOpen && 'rotate-90',
                                )}
                            />
                        </SidebarMenuAction>
                    </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent>
                    <SidebarMenu
                        className={cn(
                            'border-border/40 mt-1 ml-5 border-l pl-2',
                            sidebarState === 'collapsed' && 'hidden',
                        )}
                    >
                        {item.children.map((child) => (
                            <SidebarMenuItem key={child.title}>
                                <SidebarMenuButton
                                    asChild
                                    size="sm"
                                    isActive={isChildActive(child.url)}
                                    tooltip={child.title}
                                    className="text-muted-foreground pl-6 group-data-[collapsible=icon]:justify-start group-data-[collapsible=icon]:pl-6"
                                >
                                    <Link href={child.url}>
                                        {child.icon ? (
                                            <child.icon className="text-muted-foreground/70 h-3.5 w-3.5" />
                                        ) : (
                                            <span className="bg-muted-foreground/60 h-1.5 w-1.5 rounded-full" />
                                        )}
                                        <span>{child.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
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
