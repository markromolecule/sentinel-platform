

import { Switch, cn } from '@sentinel/ui';

export type ToggleRowProps = {
    label: string;
    description: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
};

export function ToggleRow({
    label,
    description,
    checked,
    onCheckedChange,
    disabled,
    className,
}: ToggleRowProps) {
    return (
        <div
            className={cn(
                'hover:bg-muted/30 flex items-center justify-between gap-6 rounded-lg px-1 py-4 transition-colors',
                className,
            )}
        >
            <div className="min-w-0 space-y-1">
                <p className="text-sm font-semibold tracking-tight">{label}</p>
                <p className="text-muted-foreground max-w-md text-xs leading-relaxed">
                    {description}
                </p>
            </div>
            <Switch
                checked={checked}
                onCheckedChange={onCheckedChange}
                disabled={disabled}
                className="data-[state=checked]:bg-primary"
            />
        </div>
    );
}

