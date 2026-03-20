"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarRail,
    SidebarSeparator,
    useSidebar,
} from "@sentinel/ui";
import {
    DASHBOARD_ITEMS,
    MANAGEMENT_ITEMS,
    ANALYTICS_ITEMS,
    COMMUNICATION_ITEMS
} from "./constants";
import { useDashboardNav } from "../common/hooks/use-dashboard-nav";
import { DashboardSidebarItem } from "../common/dashboard-sidebar-item";

export function AdminSidebar() {
    const { state, setOpen } = useSidebar();
    const {
        pathname,
        openMenus,
        toggleMenu,
        isChildActive,
    } = useDashboardNav();

    const sections = [
        { label: "Overview", items: DASHBOARD_ITEMS, showSeparator: true },
        { label: "Management", items: MANAGEMENT_ITEMS, showSeparator: true },
        { label: "Analytics & Logs", items: ANALYTICS_ITEMS, showSeparator: true },
        { label: "Communication", items: COMMUNICATION_ITEMS, showSeparator: true },
    ];

    return (
        <Sidebar
            collapsible="icon"
            className="border-r border-border/40 transition-all duration-300 ease-in-out z-50 top-16! h-[calc(100svh-4rem)]!"
            onMouseEnter={() => {
                if (state === "collapsed") setOpen(true);
            }}
            onMouseLeave={() => {
                if (state === "expanded") setOpen(false);
            }}
        >
            <SidebarContent>
                {sections.map((section, index) => (
                    <div key={index}>
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {section.items.map((item) => (
                                        <DashboardSidebarItem
                                            key={item.title}
                                            item={item}
                                            pathname={pathname}
                                            isOpen={openMenus[item.title]}
                                            onOpenChange={(open) => toggleMenu(item.title, open)}
                                            isChildActive={isChildActive}
                                            sidebarState={state}
                                        />
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                        {section.showSeparator && <SidebarSeparator />}
                    </div>
                ))}
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
}
