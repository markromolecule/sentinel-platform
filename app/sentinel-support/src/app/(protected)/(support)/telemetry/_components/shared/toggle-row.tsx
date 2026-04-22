'use client';

import { Switch } from '@sentinel/ui';

export type ToggleRowProps = {
    label: string;
    description: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
};

export function ToggleRow({ label, description, checked, onCheckedChange, disabled }: ToggleRowProps) {
    return (
        <div className="flex items-center justify-between gap-6 py-4 px-1 transition-colors hover:bg-muted/30 rounded-lg">
            <div className="min-w-0 space-y-1">
                <p className="text-sm font-semibold tracking-tight">{label}</p>
                <p className="text-muted-foreground text-xs leading-relaxed max-w-md">{description}</p>
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
