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
} from "@/components/protected/admin/constants";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@sentinel/ui";

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

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
            <SidebarHeader className="border-b border-sidebar-border h-16 flex items-center justify-center p-0">
                <div className="flex items-center gap-2 p-4 w-full h-full">
                    {/* Light Mode Logo */}
                    <div className="relative h-8 w-40 dark:hidden">
                        <Image
                            src="/icons/light-sentinel-logo.svg"
                            alt="Sentinel Logo"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>
                    {/* Dark Mode Logo */}
                    <div className="relative h-8 w-40 hidden dark:block">
                        <Image
                            src="/icons/dark-sentinel-logo.svg"
                            alt="Sentinel Logo"
                            fill
                            className="object-contain object-left"
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
                                <SidebarMenuButton asChild isActive={pathname === "/admin/guide"} tooltip="Admin Guide">
                                    <Link href="/admin/guide">
                                        <Info className="h-4 w-4" />
                                        <span>Guide</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>


            </SidebarContent>
            <SidebarFooter className="border-t border-sidebar-border p-4 gap-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={handleLogout}
                            disabled={isPending}
                            tooltip="Logout"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>{isPending ? "Logging out..." : "Logout"}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
