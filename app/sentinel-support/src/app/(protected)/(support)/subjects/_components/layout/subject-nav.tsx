import Link from 'next/link';
import { cn, Separator } from '@sentinel/ui';

export type SubjectSection = 'list' | 'classifications' | 'offered' | 'requests';

const SUBJECT_NAV_GROUPS = [
    {
        title: 'Catalog',
        items: [
            { id: 'list', label: 'Subject List', href: '/subjects' },
            {
                id: 'classifications',
                label: 'Subject Classifications',
                href: '/subjects/classifications',
            },
        ],
    },
    {
        title: 'Enrollment',
        items: [
            { id: 'offered', label: 'Offered Subjects', href: '/subjects/offered' },
            { id: 'requests', label: 'Enrollment Requests', href: '/subjects/requests' },
        ],
    },
];

export type SubjectNavProps = {
    activeSection: SubjectSection;
};

/**
 * SubjectNav renders the sidebar navigation links grouped into Catalog and Enrollment sections.
 * This is used within the SubjectWorkspaceShell to provide sidebar navigation.
 *
 * @param props - SubjectNavProps containing activeSection
 */
export function SubjectNav({ activeSection }: SubjectNavProps) {
    return (
        <nav className="mt-1 flex flex-col gap-2">
            {SUBJECT_NAV_GROUPS.map((group, groupIndex) => (
                <div key={group.title} className="flex flex-col">
                    {groupIndex > 0 && <Separator className="bg-border/40 my-3" />}

                    <h3 className="text-muted-foreground/60 mb-2 px-4 text-xs font-semibold tracking-wider uppercase">
                        {group.title}
                    </h3>

                    <div className="flex flex-col gap-0.5">
                        {group.items.map((item) => {
                            const isActive = activeSection === item.id;

                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className={cn(
                                        'group flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors',
                                        isActive
                                            ? 'bg-accent/50 border-r-2 border-[#323d8f] font-semibold text-[#323d8f]'
                                            : 'text-muted-foreground hover:bg-accent/30 hover:text-foreground',
                                    )}
                                >
                                    <span className="truncate">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}
        </nav>
    );
}
