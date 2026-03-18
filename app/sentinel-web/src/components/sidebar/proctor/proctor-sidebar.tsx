"use client";

import Link from "next/link";
import NextImage from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    FileText,
    MessageSquare,
    LogOut,
    Megaphone,
    Calendar,
    UserCheck,
    BookOpen,
    HelpCircle,
    ClipboardCheck,
    ChevronRight,
} from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarTrigger,
    useSidebar,
} from "@sentinel/ui";
import { ThemeToggle } from "@sentinel/ui";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@sentinel/ui";
import { useLogoutMutation } from "@/hooks/query/auth/use-logout-mutation";
import { cn } from "@sentinel/ui";
import { useEffect, useState } from "react";

export function ProctorSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { state } = useSidebar();
    const isExamActive = pathname.startsWith("/exams");
    const [isExamMenuOpen, setIsExamMenuOpen] = useState(isExamActive);

    const { mutate: logout, isPending } = useLogoutMutation({
        onSuccess: () => {
            router.push("/auth/login");
        },
    });

    const handleLogout = () => {
        logout();
    };

    const overviewItems = [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "Calendar",
            url: "/calendar",
            icon: Calendar,
        },
    ];

    const supportItems = [
        {
            title: "Guide",
            url: "/guide",
            icon: HelpCircle,
        },
    ];

    const managementItems = [
        {
            title: "Subject Management",
            url: "/subjects",
            icon: BookOpen,
        },
        {
            title: "Student Management",
            url: "/students",
            icon: Users,
        },
        {
            title: "Exam Management",
            url: "/exams",
            icon: FileText,
            children: [
                { title: "Monitoring", url: "/exams?view=monitoring" },
                { title: "Assign", url: "/exams?view=assign" },
            ],
        },
        {
            title: "Proctor Assignment",
            url: "/assignment",
            icon: UserCheck,
        },
        {
            title: "Grading",
            url: "/grading",
            icon: ClipboardCheck,
        },
    ];


    const communicationItems = [
        {
            title: "Messages",
            url: "/messages",
            icon: MessageSquare,
        },
        {
            title: "Announcements",
            url: "/announcements",
            icon: Megaphone,
        },
    ];

    useEffect(() => {
        if (isExamActive) {
            setIsExamMenuOpen(true);
        }
    }, [isExamActive]);

    const renderMenuItems = (items: { title: string; url: string; icon: React.ElementType; children?: { title: string; url: string }[] }[]) => {
        return items.map((item) => (
            item.children ? (
                <Collapsible
                    key={item.title}
                    open={isExamMenuOpen}
                    onOpenChange={setIsExamMenuOpen}
                    className="group/collapsible"
                >
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isExamActive} tooltip={item.title}>
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
                                        isExamMenuOpen && "rotate-90"
                                    )}
                                />
                            </SidebarMenuAction>
                        </CollapsibleTrigger>
                    </SidebarMenuItem>
                    <CollapsibleContent>
                        <SidebarMenu className={cn("mt-1 ml-5 border-l border-border/40 pl-2", state === "collapsed" && "hidden")}>
                            {item.children.map((child) => (
                                <SidebarMenuItem key={child.title}>
                                    <SidebarMenuButton
                                        asChild
                                        size="sm"
                                        isActive={false}
                                        tooltip={child.title}
                                        className="pl-6 text-muted-foreground"
                                    >
                                        <Link href={child.url}>
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                                            <span>{child.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </CollapsibleContent>
                </Collapsible>
            ) : (
                <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                        <Link href={item.url}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            )
        ));
    };

    return (
        <Sidebar collapsible="icon" className="border-r border-border/40">
            {/* Header with Logo */}
            <SidebarHeader className="border-b border-border/40 h-16 flex items-center p-0">
                <div className="flex items-center gap-2 px-4 w-full h-full">
                    <div className={cn(
                        "relative transition-all duration-200",
                        state === "collapsed" ? "h-8 w-8 mx-auto" : "h-10 w-40"
                    )}>
                        <NextImage
                            src={state === "collapsed" ? "/icons/icon0.svg" : "/icons/light-sentinel-logo.svg"}
                            alt="Sentinel Logo"
                            fill
                            className="object-contain dark:hidden"
                            priority
                        />
                        <NextImage
                            src={state === "collapsed" ? "/icons/icon0.svg" : "/icons/dark-sentinel-logo.svg"}
                            alt="Sentinel Logo"
                            fill
                            className="object-contain hidden dark:block"
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
                            {renderMenuItems(overviewItems)}
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
                            {renderMenuItems(supportItems)}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="mt-auto">
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <ThemeToggle />
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Footer with User Profile */}
            <SidebarFooter className="border-t border-border/40 p-2 group-data-[state=expanded]:p-4 gap-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 group-data-[collapsible=icon]:justify-center"
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

export function ProctorHeader() {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 px-4 bg-background/80 backdrop-blur-md sticky top-0 z-10">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1" />
        </header>
    );
}
