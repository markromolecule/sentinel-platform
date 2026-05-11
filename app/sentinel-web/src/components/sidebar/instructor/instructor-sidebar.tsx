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
import { useInstructorNav } from '@/components/sidebar/instructor/hooks/use-instructor-nav';
import { InstructorSidebarItem } from '@/components/sidebar/instructor/instructor-sidebar-item';
import {
    overviewItems,
    supportItems,
    managementItems,
    communicationItems,
} from '@/components/sidebar/instructor/constants';

export { InstructorHeader } from './instructor-header';

export function InstructorSidebar() {
    const { state, setOpen } = useSidebar();
    const {
        pathname,
        isExamActive,
        isExamMenuOpen,
        setIsExamMenuOpen,
        isSubjectsActive,
        isSubjectsMenuOpen,
        setIsSubjectsMenuOpen,
        isQuestionBankActive,
        isQuestionBankMenuOpen,
        setIsQuestionBankMenuOpen,
        isChildActive,
    } = useInstructorNav();

    const sections = [
        { title: 'Overview', items: overviewItems, showSeparator: true },
        { title: 'Management', items: managementItems, showSeparator: true },
        { title: 'Communication', items: communicationItems, showSeparator: true },
        { title: 'Resources', items: supportItems, showSeparator: false },
    ];

    return (
        <Sidebar
            collapsible="icon"
            className="border-border/40 top-16! z-50 h-[calc(100svh-4rem)]! border-r transition-all duration-300 ease-in-out"
            onMouseEnter={() => {
                if (state === 'collapsed') setOpen(true);
            }}
            onMouseLeave={() => {
                if (state === 'expanded') setOpen(false);
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
                                            isActive={
                                                item.title === 'Question Bank'
                                                    ? isQuestionBankActive
                                                    : item.title === 'Subjects'
                                                      ? isSubjectsActive
                                                      : item.title === 'Exams'
                                                        ? isExamActive
                                                        : pathname === item.url
                                            }
                                            isOpen={
                                                item.title === 'Question Bank'
                                                    ? isQuestionBankMenuOpen
                                                    : item.title === 'Subjects'
                                                      ? isSubjectsMenuOpen
                                                      : isExamMenuOpen
                                            }
                                            setIsOpen={
                                                item.title === 'Question Bank'
                                                    ? setIsQuestionBankMenuOpen
                                                    : item.title === 'Subjects'
                                                      ? setIsSubjectsMenuOpen
                                                      : setIsExamMenuOpen
                                            }
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
