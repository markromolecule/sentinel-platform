import { Activity, Shield, Layout, Eye, Cpu, type LucideIcon } from 'lucide-react';
import { cn } from '@sentinel/ui';

export type ExaminationSettingsSection = 'overview' | 'general' | 'behavior' | 'safeguards' | 'monitoring';

interface NavItem {
    id: ExaminationSettingsSection;
    label: string;
    icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'general', label: 'General Baseline', icon: Layout },
    { id: 'behavior', label: 'Attempt Dynamics', icon: Shield },
    { id: 'safeguards', label: 'Safeguards', icon: Eye },
    { id: 'monitoring', label: 'AI Monitoring', icon: Cpu },
];

interface ExaminationSettingsNavProps {
    activeSection: ExaminationSettingsSection;
    onSectionChange: (section: ExaminationSettingsSection) => void;
}

export function ExaminationSettingsNav({ activeSection, onSectionChange }: ExaminationSettingsNavProps) {
    return (
        <nav className="flex w-56 shrink-0 flex-col gap-1">
            {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => onSectionChange(item.id)}
                        className={cn(
                            'group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-all duration-200',
                            isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                        )}
                    >
                        <Icon className={cn(
                            'size-4 shrink-0 transition-colors',
                            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground/80'
                        )} />
                        <span>{item.label}</span>
                        {isActive && (
                            <div className="ml-auto size-1.5 rounded-full bg-primary animate-pulse" />
                        )}
                    </button>
                );
            })}
        </nav>
    );
}
