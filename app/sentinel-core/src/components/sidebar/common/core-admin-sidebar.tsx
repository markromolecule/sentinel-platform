'use client';

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarRail,
    SidebarSeparator,
    useSidebar,
} from '@sentinel/ui';
import { useDashboardNav } from './hooks/use-dashboard-nav';
import { DashboardSidebarItem } from './dashboard-sidebar-item';
import { useCoreAdminCapabilities } from '@/hooks/use-core-admin-capabilities';

/**
 * Renders the centralized admin sidebar using permission-aware navigation sections.
 */
export function CoreAdminSidebar() {
    const { state, setOpen } = useSidebar();
    const { pathname, openMenus, toggleMenu, isChildActive } = useDashboardNav();
    const { visibleNavigationSections } = useCoreAdminCapabilities();

    return (
        <Sidebar
            collapsible="icon"
            className="border-border/40 top-16! z-50 h-[calc(100svh-4rem)]! border-r transition-all duration-300 ease-in-out"
            onMouseEnter={() => {
                if (state === 'collapsed') {
                    setOpen(true);
                }
            }}
            onMouseLeave={() => {
                if (state === 'expanded') {
                    setOpen(false);
                }
            }}
        >
            <SidebarContent>
                {visibleNavigationSections.map((section, index) => (
                    <div key={section.label}>
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
                        {section.showSeparator && index < visibleNavigationSections.length - 1 ? (
                            <SidebarSeparator />
                        ) : null}
                    </div>
                ))}
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
}
