"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarRail,
    SidebarFooter,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    Collapsible,
    CollapsibleTrigger,
    CollapsibleContent,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    useSidebar,
    cn
} from "@sentinel/ui";
import {
    LogOut,
    Info,
    ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

import { useLogoutMutation } from "@/hooks/query/auth/use-logout-mutation";
import { toast } from "sonner";
import {
    DASHBOARD_ITEMS,
    MANAGEMENT_ITEMS,
    ANALYTICS_ITEMS,
    COMMUNICATION_ITEMS
} from "@/components/sidebar/superadmin/constants";

export function SuperAdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { state, isMobile } = useSidebar();

    const { mutate: logout, isPending } = useLogoutMutation({
        onSuccess: () => {
            router.push("/auth/login");
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const handleLogout = () => {
        logout();
    };

    const renderMenuItems = (items: typeof MANAGEMENT_ITEMS) => {
        return items.map((item) => {
            if ("subItems" in item && item.subItems) {
                const isActive = item.url === pathname || item.subItems.some((sub) => sub.url === pathname);

                if (state === "collapsed" && !isMobile) {
                    return (
                        <SidebarMenuItem key={item.title}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton isActive={isActive}>
                                        <item.icon className="h-4 w-4" />
                                        <span>{item.title}</span>
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent side="right" align="start">
                                    <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {item.subItems.map((subItem) => (
                                        <DropdownMenuItem key={subItem.title} asChild>
                                            <Link href={subItem.url} className="w-full">
                                                <span>{subItem.title}</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    );
                }

                return (
                    <Collapsible key={item.title} asChild defaultOpen={isActive}>
                        <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton
                                    tooltip={item.title}
                                    isActive={isActive}
                                    onClick={() => router.push(item.url)}
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.title}</span>
                                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    {item.subItems.map((subItem) => (
                                        <SidebarMenuSubItem key={subItem.title}>
                                            <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                                                <Link href={subItem.url}>
                                                    <span>{subItem.title}</span>
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    ))}
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </Collapsible>
                );
            }

            return (
                <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                        <Link href={item.url}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            );
        });
    };

    return (
        <Sidebar collapsible="icon" className="border-r border-sidebar-border">
            <SidebarHeader className="border-b border-sidebar-border h-16 flex items-center p-0">
                <div className="flex items-center gap-2 px-4 w-full h-full">
                    <div className={cn(
                        "relative transition-all duration-200",
                        state === "collapsed" ? "h-8 w-8 mx-auto" : "h-10 w-40"
                    )}>
                        <Image
                            src={state === "expanded" ? "/icons/light-sentinel-logo.svg" : "/icons/icon0.svg"}
                            alt="Sentinel Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Overview</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {renderMenuItems(DASHBOARD_ITEMS)}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Management</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {renderMenuItems(MANAGEMENT_ITEMS)}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Analytics & Logs</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {renderMenuItems(ANALYTICS_ITEMS)}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Communication</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {renderMenuItems(COMMUNICATION_ITEMS)}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Support</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/superadmin/guide"} tooltip="SuperAdmin Guide">
                                    <Link href="/superadmin/guide">
                                        <Info className="h-4 w-4" />
                                        <span>Guide</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t border-sidebar-border p-2 group-data-[state=expanded]:p-4 gap-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={handleLogout}
                            disabled={isPending}
                            tooltip="Logout"
                        >
                            <LogOut className="h-4 w-4 shrink-0" />
                            <span className="truncate group-data-[collapsible=icon]:hidden">
                                {isPending ? "Logging out..." : "Logout"}
                            </span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}