import { cn, Separator } from '@sentinel/ui';

export type TelemetrySection = 'operations' | 'rules' | 'sandbox' | 'health' | 'audio-calibration';

const TELEMETRY_NAV_GROUPS = [
    {
        title: 'Overview',
        items: [{ id: 'health', label: 'System Health' }],
    },
    {
        title: 'Runtime',
        items: [
            { id: 'operations', label: 'Operations' },
            { id: 'rules', label: 'Rule Overrides' },
        ],
    },
    {
        title: 'Configure',
        items: [
            { id: 'audio-calibration', label: 'Audio Calibration' },
            { id: 'sandbox', label: 'MediaPipe Sandbox' },
        ],
    },
];

export type TelemetryNavProps = {
    activeSection: string;
    onActiveSectionChange: (id: TelemetrySection) => void;
};

export function TelemetryNav({ activeSection, onActiveSectionChange }: TelemetryNavProps) {
    return (
        <nav className="mt-1 flex flex-col gap-2">
            {TELEMETRY_NAV_GROUPS.map((group, groupIndex) => (
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
                                        onActiveSectionChange(item.id as TelemetrySection)
                                    }
                                    className={cn(
                                        'group flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors',
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
