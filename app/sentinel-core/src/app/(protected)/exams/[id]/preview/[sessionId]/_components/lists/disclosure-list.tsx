import { LucideIcon } from 'lucide-react';

interface Disclosure {
    label: string;
    desc: string;
    icon: LucideIcon;
}

interface DisclosureListProps {
    items: Disclosure[];
}

export function DisclosureList({ items }: DisclosureListProps) {
    return (
        <div className="space-y-5">
            {items.map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                    <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                        <item.icon className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-semibold">{item.label}</h3>
                        <p className="text-muted-foreground text-sm leading-6 sm:text-[15px]">
                            {item.desc}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
