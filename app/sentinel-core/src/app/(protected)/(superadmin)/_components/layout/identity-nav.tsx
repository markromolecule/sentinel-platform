import Link from 'next/link';
import { cn, Separator } from '@sentinel/ui';

export type IdentitySection = 'administrators' | 'whitelist' | 'permissions';

const IDENTITY_NAV_GROUPS = [
    {
        title: 'Identity & Access',
        items: [
            { id: 'administrators', label: 'Administrators', href: '/administrators' },
            { id: 'whitelist', label: 'Whitelist', href: '/administrators/whitelist' },
            { id: 'permissions', label: 'Permissions', href: '/permissions' },
        ],
    },
];

export type IdentityNavProps = {
    activeSection: IdentitySection;
};

/**
 * IdentityNav renders the sidebar navigation links for the Identity & Access section.
 *
 * @param props - IdentityNavProps containing activeSection
 */
export function IdentityNav({ activeSection }: IdentityNavProps) {
    return (
        <nav className="mt-1 flex flex-col gap-2">
            {IDENTITY_NAV_GROUPS.map((group, groupIndex) => (
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
