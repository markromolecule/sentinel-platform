'use client';

export type LabeledFieldProps = {
    label: string;
    description?: string;
    children: React.ReactNode;
};

export function LabeledField({ label, description, children }: LabeledFieldProps) {
    return (
        <label className="grid gap-2">
            <div className="space-y-1">
                <span className="text-sm font-semibold tracking-tight block">{label}</span>
                {description ? (
                    <span className="text-muted-foreground text-xs leading-relaxed block">{description}</span>
                ) : null}
            </div>
            {children}
        </label>
    );
}
