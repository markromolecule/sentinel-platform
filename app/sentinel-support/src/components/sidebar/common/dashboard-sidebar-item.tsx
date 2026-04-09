"use client";

import Link from "next/link";
import { ChevronRight, LucideIcon } from "lucide-react";
import { cn } from "@sentinel/ui";
import {
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuAction,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from "@sentinel/ui";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@sentinel/ui";

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
    sidebarState: "expanded" | "collapsed";
}

export function DashboardSidebarItem({
    item,
    pathname,
    isOpen,
    onOpenChange,
    isChildActive,
    sidebarState,
}: DashboardSidebarItemProps) {
    const isItemActive = pathname === item.url || pathname.startsWith(`${item.url}/`);

    if (item.subItems) {
        const isActive = isItemActive || item.subItems.some((sub) => isChildActive(sub.url));

        return (
            <Collapsible
                key={item.title}
                open={isOpen}
                onOpenChange={onOpenChange}
                className="group/collapsible"
                defaultOpen={isActive}
            >
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title} className="group-data-[collapsible=icon]:justify-start">
                        <Link href={item.url}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                        </Link>
                    </SidebarMenuButton>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuAction className="group-data-[collapsible=icon]:hidden">
                            <ChevronRight
                                className={cn(
                                    "h-4 w-4 transition-transform",
                                    isOpen && "rotate-90"
                                )}
                            />
                        </SidebarMenuAction>
                    </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent>
                    <SidebarMenuSub className={cn("mt-1 ml-5 border-l border-border/40 pl-2", sidebarState === "collapsed" && "hidden")}>
                        {item.subItems.map((child) => (
                            <SidebarMenuSubItem key={child.title}>
                                <SidebarMenuSubButton
                                    asChild
                                    size="sm"
                                    isActive={isChildActive(child.url)}
                                    className="pl-6 text-muted-foreground group-data-[collapsible=icon]:justify-start group-data-[collapsible=icon]:pl-6 h-8"
                                >
                                    <Link href={child.url}>
                                        <span className={cn(
                                            "h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0 mr-2",
                                            isChildActive(child.url) && "bg-primary"
                                        )} />
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
                isActive={isItemActive}
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
