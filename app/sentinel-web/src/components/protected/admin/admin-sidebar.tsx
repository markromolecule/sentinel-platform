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
} from "@/components/ui/sidebar";
import {
    LayoutDashboard,
    Users,
    ClipboardList,
    UserCheck,
    BarChart3,
    FileText,
    Megaphone,
    LogOut,
    MessageSquare,
    Calendar,
    BookOpen,
    Building2,
    Layers,
    Info,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

import { useLogoutMutation } from "@/hooks/query/auth/use-logout-mutation";
import { toast } from "sonner";

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

    const dashboardItems = [
        {
            title: "Dashboard",
            url: "/admin/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "Calendar",
            url: "/admin/calendar",
            icon: Calendar,
        },
    ];

    const managementItems = [
        {
            title: "Department Management",
            url: "/admin/departments",
            icon: Building2,
        },
        {
            title: "Course Management",
            url: "/admin/courses",
            icon: BookOpen, // Using BookOpen for Courses
        },
        {
            title: "Section Management",
            url: "/admin/sections",
            icon: Layers,
        },
        {
            title: "Subject Management",
            url: "/admin/subjects",
            icon: BookOpen,
        },
        {
            title: "User Management",
            url: "/admin/users",
            icon: Users,
        },
        {
            title: "Exam Management",
            url: "/admin/exams",
            icon: ClipboardList,
        },
        {
            title: "Proctor Assignment",
            url: "/admin/proctor/assignment",
            icon: UserCheck,
        },
    ];

    const analyticsItems = [
        {
            title: "Reports & Analytics",
            url: "/admin/analytics",
            icon: BarChart3,
        },
        {
            title: "System Logs",
            url: "/admin/logs",
            icon: FileText,
        },
    ];

    const communicationItems = [
        {
            title: "Messages",
            url: "/admin/messages",
            icon: MessageSquare,
        },
        {
            title: "Announcements",
            url: "/admin/announcements",
            icon: Megaphone,
        },
    ];

    const renderMenuItems = (items: typeof dashboardItems) => {
        return items.map((item) => (
            <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        ));
    };

    return (
        <Sidebar collapsible="icon" className="border-r border-sidebar-border">
            <SidebarHeader className="border-b border-sidebar-border h-20 flex items-center justify-center p-0">
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
                            {renderMenuItems(dashboardItems)}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Management</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {renderMenuItems(managementItems)}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Analytics & Logs</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {renderMenuItems(analyticsItems)}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Communication</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {renderMenuItems(communicationItems)}
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
