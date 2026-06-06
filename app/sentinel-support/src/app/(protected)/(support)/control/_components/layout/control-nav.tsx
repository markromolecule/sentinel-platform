import { cn, Separator } from '@sentinel/ui';

export type AccessControlSection =
    | 'overview'
    | 'roles'
    | 'role-matrix'
    | 'permissions'
    | 'assignments'
    | 'examination-settings';

const ACCESS_CONTROL_NAV_GROUPS = [
    {
        title: 'Overview',
        items: [
            { id: 'overview', label: 'Dashboard' },
            { id: 'assignments', label: 'Assignments' },
        ],
    },
    {
        title: 'Authorization',
        items: [
            { id: 'roles', label: 'Roles' },
            { id: 'role-matrix', label: 'Role Matrix' },
            { id: 'permissions', label: 'Permissions' },
        ],
    },
    {
        title: 'Configure',
        items: [{ id: 'examination-settings', label: 'System Settings' }],
    },
];

export type AccessControlNavProps = {
    activeSection: string;
    onActiveSectionChange: (id: AccessControlSection) => void;
};

export function AccessControlNav({ activeSection, onActiveSectionChange }: AccessControlNavProps) {
    return (
        <nav className="mt-1 flex flex-col gap-2">
            {ACCESS_CONTROL_NAV_GROUPS.map((group, groupIndex) => (
                <div key={group.title} className="flex flex-col">
                    {groupIndex > 0 && <Separator className="bg-border/40 my-3" />}

                    <h3 className="text-muted-foreground/60 mb-2 px-4 text-xs font-semibold tracking-wider uppercase">
                        {group.title}
                    </h3>

                    <div className="flex flex-col gap-0.5">
                        {group.items.map((item) => {
                            const isActive = activeSection === item.id;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() =>
                                        onActiveSectionChange(item.id as AccessControlSection)
                                    }
                                    className={cn(
                                        'group flex items-center px-4 py-2 text-left text-sm transition-colors',
                                        isActive
                                            ? 'bg-accent/50 border-r-2 border-[#323d8f] font-semibold text-[#323d8f]'
                                            : 'text-muted-foreground hover:bg-accent/30 hover:text-foreground',
                                    )}
                                >
                                    <span className="truncate">{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </nav>
    );
}
