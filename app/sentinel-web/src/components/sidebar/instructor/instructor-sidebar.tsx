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
import { useInstructorNav } from "@/components/sidebar/instructor/hooks/use-instructor-nav";
import { InstructorSidebarItem } from "@/components/sidebar/instructor/instructor-sidebar-item";
import {
    overviewItems,
    supportItems,
    managementItems,
    communicationItems,
} from "@/components/sidebar/instructor/constants";

export { InstructorHeader } from "./instructor-header";

export function InstructorSidebar() {
    const { state, setOpen } = useSidebar();
    const {
        pathname,
        isExamActive,
        isExamMenuOpen,
        setIsExamMenuOpen,
        isChildActive,
    } = useInstructorNav();

    const sections = [
        { items: overviewItems, showSeparator: true },
        { items: managementItems, showSeparator: true },
        { items: communicationItems, showSeparator: true },
        { items: supportItems, showSeparator: false },
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
                                        <InstructorSidebarItem
                                            key={item.title}
                                            item={item}
                                            pathname={pathname}
                                            isExamActive={isExamActive}
                                            isExamMenuOpen={isExamMenuOpen}
                                            setIsExamMenuOpen={setIsExamMenuOpen}
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
